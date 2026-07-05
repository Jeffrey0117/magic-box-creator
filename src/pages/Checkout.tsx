import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PayuniEmbedCheckout } from "@/components/PayuniEmbedCheckout";

const PAYGATE_URL = import.meta.env.VITE_PAYGATE_URL || "";

const TIERS = {
  standard: {
    name: "標準版",
    fallbackPrice: 299,
    features: ["無限資料包", "全部模板", "進階數據分析", "多關鍵字規則", "Email 支援"],
  },
  premium: {
    name: "專業版",
    fallbackPrice: 599,
    features: ["標準版所有功能", "API 整合", "白標選項", "優先客服"],
  },
} as const;

type TierKey = keyof typeof TIERS;

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tierParam = searchParams.get("tier");
  const tier: TierKey = tierParam === "premium" ? "premium" : "standard";
  const info = TIERS[tier];

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [price, setPrice] = useState<number>(info.fallbackPrice);
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  // 淺色結帳頁：把深色主題的 body 背景暫時蓋成淺色，避免手機下方露出深色（body 是 fixed 深色漸層）
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#F8F7F5";
    return () => { document.body.style.background = prev; };
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info("請先登入，再進行訂閱");
        navigate(`/login?returnTo=${encodeURIComponent(`/checkout?tier=${tier}`)}`);
        return;
      }
      setUser({ id: session.user.id, email: session.user.email || "" });
      setBillingEmail(session.user.email || "");

      // 帶入既有暱稱當帳單姓名預設
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile?.display_name) setBillingName(profile.display_name);

      // 價格以 PayGate 為準（後端結帳時也會再驗一次）
      if (PAYGATE_URL) {
        try {
          const res = await fetch(`${PAYGATE_URL}/api/plans?product=keybox`);
          const data = await res.json();
          const plan = (data.plans || []).find((p: { tier: string }) => p.tier === tier);
          if (typeof plan?.price === "number") setPrice(plan.price);
        } catch { /* 用預設價格 */ }
      }
      setLoading(false);
    })();
  }, [tier, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F7F5" }}>
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "#F8F7F5" }}>
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> 返回
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">確認訂閱</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左：訂單明細 */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">訂單明細</h2>
                {/* 方案名獨立一行，價錢只在下方「本次應付」出現一次，不擠不重複 */}
                <div className="text-xl font-bold text-slate-800 tracking-tight">KeyBox {info.name}</div>
                <p className="text-sm text-slate-500 mt-1 mb-4">每月自動續訂，可隨時取消</p>
                <Separator className="my-4 bg-slate-200" />
                <ul className="space-y-2 mb-4">
                  {info.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Separator className="my-4 bg-slate-200" />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-slate-800">本次應付</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">NT${price}</span>
                    <span className="text-sm text-slate-500"> / 月</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="flex items-center gap-2 text-xs text-slate-500 px-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              卡號由 PAYUNi 加密處理，本站不會接觸您的完整卡號
            </p>
          </div>

          {/* 右：帳單資訊 + 刷卡 */}
          <div className="lg:col-span-3">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* 帳單資訊 */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">帳單資訊</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billing-name" className="text-sm text-slate-700">姓名 / 抬頭</Label>
                      <Input
                        id="billing-name"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        placeholder="王小明"
                        maxLength={50}
                        className="mt-1.5 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-email" className="text-sm text-slate-700">電子郵件（收據寄送）</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1.5 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                {/* 付款方式 — 信用卡欄位直接顯示 */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">信用卡付款</h2>
                  {user && (
                    <PayuniEmbedCheckout
                      userId={user.id}
                      amount={price}
                      itemId={`keybox:${tier}:monthly`}
                      itemDesc={`KeyBox ${info.name} 月訂閱`}
                      buyerEmail={billingEmail}
                      buyerName={billingName}
                      returnUrl={`${window.location.origin}/paid`}
                      onSuccess={({ orderId }) => navigate(`/paid?order=${orderId}`)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

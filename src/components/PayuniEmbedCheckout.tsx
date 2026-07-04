// PayUni 免跳轉支付元件(UNi Embed) — payuni-embed-kit 樣板(Vite 版)
// 流程:create-embed-session 取 SDK_Token → 掛信用卡 iframe → getTradeResult 綁卡 → embed-charge 幕後授權
// 卡號不經過本站(在 PayUni iframe 內)、金額由伺服器決定。

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SDK_SRC = "https://vendor.payuni.com.tw/sdk/uni-payment.js";
const SDK_ENV = import.meta.env.VITE_PAYUNI_ENV === "sandbox" ? "S" : "P";
const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

type FieldStatus = { CardNo: unknown; CardExp: unknown; CardCvc: unknown };

export interface PayuniEmbedCheckoutProps {
  userId: string;
  amount: number;
  itemId: string;
  itemDesc: string;
  buyerEmail: string;
  /** 帳單姓名/抬頭（選填，存入訂單供對帳/收據） */
  buyerName?: string;
  /** 付款完成(含3D)導回的網址 */
  returnUrl: string;
  /** 非3D、當場授權成功時的 callback */
  onSuccess?: (info: { orderId: string; tradeNo?: string }) => void;
  /** 備案:元件起不來(gateway IP 漂移被 PayUni 擋)時的處理 */
  onFallback?: () => void;
}

// 取當前登入者的 access token 當 Authorization(給 edge 的 requireUser 驗)
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function loadSdk(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.UniPayment) return resolve(w.UniPayment);
    const ex = document.querySelector(`script[src="${SDK_SRC}"]`) as HTMLScriptElement | null;
    if (ex) {
      ex.addEventListener("load", () => resolve(w.UniPayment));
      ex.addEventListener("error", () => reject(new Error("PayUni SDK 載入失敗")));
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.async = true;
    s.onload = () => resolve(w.UniPayment);
    s.onerror = () => reject(new Error("PayUni SDK 載入失敗"));
    document.body.appendChild(s);
  });
}

// 同商店多專案共用 PayUni:MerTradeNo 前綴 KB 避免跨專案撞單
function genOrderId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KB${t}${r}`;
}

export function PayuniEmbedCheckout(props: PayuniEmbedCheckoutProps) {
  const { amount, returnUrl, onSuccess } = props;
  const [initState, setInitState] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [initError, setInitError] = useState("");
  const [fields, setFields] = useState<FieldStatus>({ CardNo: null, CardExp: null, CardCvc: null });
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  const sdkRef = useRef<any>(null);
  const orderIdRef = useRef("");
  const initedRef = useRef(false);
  const propsRef = useRef(props);
  propsRef.current = props;

  const init = useCallback(async () => {
    if (initedRef.current) return;
    initedRef.current = true;
    setInitState("loading");
    setInitError("");
    try {
      const p = propsRef.current;
      const orderId = genOrderId();
      orderIdRef.current = orderId;

      const res = await fetch(`${FN_BASE}/create-embed-session`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          orderId,
          amount: p.amount,
          itemId: p.itemId,
          itemDesc: p.itemDesc,
          buyerEmail: p.buyerEmail,
          buyerName: p.buyerName,
          userId: p.userId,
          iframeDomain: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.sdkToken) throw new Error(data.error || data.detail || "無法建立付款");

      const UniPayment = await loadSdk();
      const sdk = UniPayment.createSession(data.sdkToken, {
        env: SDK_ENV,
        useInst: false,
        elements: { CardNo: "put_card_no", CardExp: "put_card_exp", CardCvc: "put_card_cvc" },
        style: { color: "#0f172a", errorColor: "#dc2626", fontSize: "15px", fontWeight: "400", lineHeight: "24px" },
      });
      sdk.onUpdate((u: any) => { if (u?.status) setFields(u.status as FieldStatus); });
      await sdk.start();
      sdkRef.current = sdk;
      setInitState("ready");
    } catch (e: any) {
      console.error("[embed] init failed:", e);
      if (propsRef.current.onFallback) {
        setInitError("站內付款暫時無法使用…");
        setInitState("error");
        propsRef.current.onFallback();
        return;
      }
      setInitError(e?.message || "初始化失敗");
      setInitState("error");
      initedRef.current = false;
    }
  }, []);

  useEffect(() => { init(); /* eslint-disable-next-line */ }, []);

  const allValid = fields.CardNo === true && fields.CardExp === true && fields.CardCvc === true;

  const handlePay = async () => {
    if (!sdkRef.current || processing) return;
    setProcessing(true);
    setPayError("");
    try {
      await sdkRef.current.getTradeResult(); // 綁卡(卡號在 iframe 內)
      const finalReturn = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}order=${orderIdRef.current}`;
      const res = await fetch(`${FN_BASE}/embed-charge`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ orderId: orderIdRef.current, returnUrl: finalReturn }),
      });
      const data = await res.json();
      if (data.need3d && data.url) { window.location.href = data.url; return; }
      if (data.ok) {
        if (onSuccess) onSuccess({ orderId: orderIdRef.current, tradeNo: data.tradeNo });
        else window.location.href = returnUrl;
        return;
      }
      setPayError(data.message || data.error || "授權失敗，請確認卡片或改用其他卡");
      setProcessing(false);
    } catch (e: any) {
      console.error("[embed] pay failed:", e);
      setPayError(e?.message === "Code 1005" ? "卡片資料有誤，請重新確認" : e?.message || "付款失敗，請重試");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {initState === "error" && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive font-medium">付款元件載入失敗</p>
          <p className="text-muted-foreground mt-1">{initError}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => init()}>重試</Button>
          </div>
        </div>
      )}

      <div className={initState === "ready" ? "space-y-3" : "space-y-3 opacity-50 pointer-events-none"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">信用卡號</label>
          <div id="put_card_no" className="h-11 rounded-md border border-input bg-background px-3 flex items-center" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">有效期限 (MM/YY)</label>
            <div id="put_card_exp" className="h-11 rounded-md border border-input bg-background px-3 flex items-center" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">安全碼 (CVC)</label>
            <div id="put_card_cvc" className="h-11 rounded-md border border-input bg-background px-3 flex items-center" />
          </div>
        </div>
      </div>

      {initState === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> 載入安全付款元件…
        </div>
      )}

      {payError && <p className="text-sm text-destructive">{payError}</p>}

      <Button onClick={handlePay} disabled={initState !== "ready" || !allValid || processing} size="lg" className="w-full">
        {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />授權中…</> : <><CreditCard className="mr-2 h-4 w-4" />確認付款 NT$ {amount.toLocaleString()}</>}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" />
        卡號由 PAYUNi 加密處理，本站不會接觸您的完整卡號
      </p>
    </div>
  );
}

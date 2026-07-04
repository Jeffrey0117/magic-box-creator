import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowLeft, Flame, Sparkles, Crown, Zap } from "lucide-react";

// 早鳥特價：原價為行銷定錨，實際扣款金額由後端（PayGate）決定，前端改不了
const PLANS = [
  {
    tier: "free" as const,
    name: "免費版",
    icon: <Sparkles className="w-5 h-5" />,
    originalPrice: null,
    price: 0,
    tagline: "先試試水溫",
    cta: "目前方案",
    highlight: false,
  },
  {
    tier: "standard" as const,
    name: "標準版",
    icon: <Zap className="w-5 h-5" />,
    originalPrice: 599,
    price: 299,
    tagline: "個人創作者首選",
    cta: "立即升級標準版",
    highlight: true,
  },
  {
    tier: "premium" as const,
    name: "專業版",
    icon: <Crown className="w-5 h-5" />,
    originalPrice: 1180,
    price: 599,
    tagline: "專業變現 / 團隊",
    cta: "立即升級專業版",
    highlight: false,
  },
];

// 功能比較（true=有 / false=無 / 字串=數量）
const FEATURES: { label: string; free: boolean | string; standard: boolean | string; premium: boolean | string }[] = [
  { label: "資料包數量", free: "3 個", standard: "無限", premium: "無限" },
  { label: "基礎模板", free: true, standard: true, premium: true },
  { label: "全部進階模板", free: false, standard: true, premium: true },
  { label: "多關鍵字解鎖規則", free: false, standard: true, premium: true },
  { label: "進階數據分析", free: false, standard: true, premium: true },
  { label: "CSV 名單匯出", free: true, standard: true, premium: true },
  { label: "限時 / 限量控制", free: true, standard: true, premium: true },
  { label: "API 整合", free: false, standard: false, premium: true },
  { label: "白標（隱藏 KeyBox 品牌）", free: false, standard: false, premium: true },
  { label: "優先客服", free: false, standard: false, premium: true },
];

const cell = (v: boolean | string) => {
  if (v === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  if (v === false) return <X className="w-4 h-4 text-slate-300 mx-auto" />;
  return <span className="text-sm font-medium text-slate-700">{v}</span>;
};

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: "#F8F7F5" }}>
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> 返回
        </Button>

        {/* 限時活動橫幅 */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
            <Flame className="w-4 h-4" />
            早鳥限時 5 折 · 名額有限，恢復原價前把握機會
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">選擇你的方案</h1>
          <p className="text-lg text-slate-600">升級解鎖無限資料包與進階功能，讓你的內容真正變現</p>
        </div>

        {/* 方案卡 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {PLANS.map((p) => {
            const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
            return (
              <Card
                key={p.tier}
                className={`relative bg-white ${
                  p.highlight ? "border-2 border-green-500 shadow-xl shadow-green-200/40 md:-translate-y-2" : "border-slate-200 shadow-sm"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white border-0 px-3 py-1">🔥 最受歡迎</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1 text-slate-700">
                    {p.icon}
                    <h3 className="text-xl font-bold">{p.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{p.tagline}</p>

                  {/* 價格區 */}
                  <div className="mb-5">
                    {p.price === 0 ? (
                      <div className="text-3xl font-bold text-slate-800">免費</div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400 line-through">NT${p.originalPrice}</span>
                          <Badge className="bg-red-100 text-red-600 border-0 text-xs">省 {discount}%</Badge>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-green-600">NT${p.price}</span>
                          <span className="text-slate-500">/ 月</span>
                        </div>
                        <p className="text-xs text-red-500 mt-1 font-medium">⏰ 早鳥價，活動結束恢復 NT${p.originalPrice}</p>
                      </>
                    )}
                  </div>

                  {p.tier === "free" ? (
                    <Button variant="outline" className="w-full bg-white border-slate-300 text-slate-500" disabled>
                      目前方案
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${p.highlight ? "bg-green-500 hover:bg-green-600 text-white" : "gradient-magic"}`}
                      onClick={() => navigate(`/checkout?tier=${p.tier}`)}
                    >
                      {p.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 功能比較表 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-sm font-semibold text-slate-600 p-4">功能</th>
                  <th className="text-center text-sm font-semibold text-slate-600 p-4">免費版</th>
                  <th className="text-center text-sm font-semibold text-green-600 p-4">標準版</th>
                  <th className="text-center text-sm font-semibold text-purple-600 p-4">專業版</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr key={f.label} className={i % 2 ? "bg-slate-50/50" : ""}>
                    <td className="text-sm text-slate-700 p-4">{f.label}</td>
                    <td className="text-center p-4">{cell(f.free)}</td>
                    <td className="text-center p-4">{cell(f.standard)}</td>
                    <td className="text-center p-4">{cell(f.premium)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 底部 CTA */}
        <div className="text-center mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">現在升級，鎖定早鳥價</h2>
          <p className="text-slate-600">活動結束後恢復原價，現有訂閱不受影響</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8" onClick={() => navigate("/checkout?tier=standard")}>
              <Zap className="w-4 h-4 mr-2" /> 升級標準版 NT$299/月
            </Button>
            <Button size="lg" variant="outline" className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50 px-8" onClick={() => navigate("/checkout?tier=premium")}>
              <Crown className="w-4 h-4 mr-2" /> 升級專業版 NT$599/月
            </Button>
          </div>
          <p className="text-xs text-slate-400 pt-2">站內安全刷卡（PAYUNi 加密）· 可隨時取消</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

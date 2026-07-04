import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Lock, Crown, Zap, Sparkles, ArrowRight } from "lucide-react";

const FREE_PACKAGE_LIMIT = 3;

interface UpgradePromoProps {
  tier: string;
  packageCount: number;
}

// 後台會員狀態 + 升級誘導卡
export const UpgradePromo = ({ tier, packageCount }: UpgradePromoProps) => {
  const navigate = useNavigate();

  // 專業版：已到頂，只做感謝，不再推銷
  if (tier === "premium") {
    return (
      <Card className="mb-6 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
        <CardContent className="flex items-center gap-3 p-6">
          <Crown className="w-6 h-6 text-purple-500 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">專業版會員</p>
            <p className="text-sm text-muted-foreground">你已解鎖所有功能，感謝訂閱 🎉</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 標準版：推專業版（進階模板已含，主打 API / 白標 / 優先客服）
  if (tier === "standard") {
    return (
      <Card className="mb-6 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Crown className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">升級專業版，解鎖商用功能</p>
                  <Badge className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 border-0 text-xs">早鳥 5 折</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  API 整合、白標（隱藏 KeyBox 品牌）、優先客服
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/pricing")} className="gradient-magic shrink-0 gap-2 w-full sm:w-auto">
              查看專業版 <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 免費版：用量壓力 + 解鎖清單 + 早鳥價，導向方案頁
  const used = Math.min(packageCount, FREE_PACKAGE_LIMIT);
  const atLimit = packageCount >= FREE_PACKAGE_LIMIT;
  const pct = Math.min(100, (packageCount / FREE_PACKAGE_LIMIT) * 100);

  return (
    <Card className="mb-6 border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 via-transparent to-transparent overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-slate-400" />
          <span className="font-semibold text-foreground">免費版</span>
          <Badge className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 border-0 text-xs ml-auto">
            🔥 早鳥限時 5 折
          </Badge>
        </div>

        {/* 資料包用量壓力條 */}
        <div className="mb-5">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">資料包用量</span>
            <span className={`font-semibold ${atLimit ? "text-red-500" : "text-foreground"}`}>
              {packageCount} / {FREE_PACKAGE_LIMIT}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${atLimit ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {atLimit ? (
            <p className="text-xs text-red-500 mt-1.5 font-medium">
              ⚠️ 已達免費上限，升級標準版即可建立無限資料包
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1.5">
              免費版最多 {FREE_PACKAGE_LIMIT} 個，還可建立 {FREE_PACKAGE_LIMIT - used} 個
            </p>
          )}
        </div>

        {/* 升級解鎖清單 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {[
            "無限資料包",
            "全部進階模板",
            "多關鍵字解鎖規則",
            "進階數據分析",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
            </div>
          ))}
        </div>

        {/* 價格 + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-slate-400 line-through">NT$599</span>
            <span className="text-2xl font-bold text-green-600">NT$299</span>
            <span className="text-sm text-muted-foreground">/ 月起</span>
          </div>
          <Button onClick={() => navigate("/pricing")} className="gradient-magic gap-2 w-full sm:w-auto">
            <Zap className="w-4 h-4" /> 查看方案並升級
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePromo;

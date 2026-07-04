import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// 付款完成頁(免跳轉當場成功 / 3D 驗證導回都會到這)
const Paid = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order") || "";
  const [orderStatus, setOrderStatus] = useState<"loading" | "paid" | "pending" | "unknown">("loading");

  useEffect(() => {
    if (!orderId) {
      setOrderStatus("unknown");
      return;
    }
    // RLS: 只有訂單主人讀得到自己的訂單
    supabase
      .from("payment_orders" as any)
      .select("status")
      .eq("order_id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        const status = (data as any)?.status;
        setOrderStatus(status === "paid" ? "paid" : status === "pending" ? "pending" : "unknown");
      });
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F8F7F5" }}>
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {orderStatus === "loading" ? (
            <Loader2 className="w-14 h-14 mx-auto animate-spin text-muted-foreground" />
          ) : (
            <CheckCircle2 className="w-14 h-14 mx-auto text-green-500" />
          )}
          <h1 className="text-2xl font-bold text-slate-700">
            {orderStatus === "pending" ? "付款處理中" : "感謝訂閱 KeyBox！"}
          </h1>
          <p className="text-slate-600 text-sm">
            {orderStatus === "pending"
              ? "交易確認中，會員權益將在數分鐘內生效。"
              : "你的會員權益已生效，重新整理管理面板即可使用。"}
          </p>
          {orderId && <p className="text-xs text-slate-400 font-mono">訂單編號：{orderId}</p>}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => navigate("/creator")} className="w-full">
              前往管理面板
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              回首頁
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Paid;

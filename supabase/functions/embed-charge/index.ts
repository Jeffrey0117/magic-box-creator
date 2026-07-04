// Supabase Edge Function: embed-charge
// 免跳轉支付元件 第三步:前端 getTradeResult() 綁卡成功後呼叫,做幕後授權。
// 讀 pending 訂單金額 → 固定IP gateway/merchant-trade → 成功則把 PayUni 原始封包轉發給 payment-callback 開通。
// ⚠️ 這支也自己 requireUser 驗登入,不需 verify_jwt=false。

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/require-user.ts";

const GATEWAY_URL = Deno.env.get("PAYUNI_GATEWAY_URL")!;
const GATEWAY_SECRET = Deno.env.get("PAYUNI_GATEWAY_SECRET") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { orderId, returnUrl, api3d } = await req.json();
    if (!orderId) return json({ error: "缺少 orderId" }, 400);
    if (!GATEWAY_SECRET) return json({ error: "PAYUNI_GATEWAY_SECRET 未設定" }, 500);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 🔒 驗身分:必須登入,且只能對自己的訂單發動扣款
    const authed = await requireUser(req);
    if (!authed) return json({ error: "請先登入" }, 401);

    const { data: order, error } = await supabase.from("payment_orders").select("*").eq("order_id", orderId).single();
    if (error || !order) return json({ error: "訂單不存在" }, 404);
    if (order.user_id !== authed.id) return json({ error: "身分驗證失敗" }, 403);
    if (order.status === "paid") return json({ ok: true, alreadyPaid: true });

    const extra = order.extra_data || {};
    const sdkToken = extra.sdkToken;
    if (!sdkToken) return json({ error: "訂單缺少 SDK Token(請重新結帳)" }, 400);

    // 幕後授權(固定IP代打 PayUni merchant_trade)。NotifyURL 指回 payment-callback。
    const notifyUrl = `${supabaseUrl}/functions/v1/payment-callback`;
    const cr = await fetch(`${GATEWAY_URL}/merchant-trade`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-gateway-secret": GATEWAY_SECRET },
      body: JSON.stringify({
        merTradeNo: order.order_id,
        token: sdkToken,
        tradeAmt: order.amount,
        prodDesc: extra.itemDesc || "訂單",
        notifyUrl,
        returnUrl: returnUrl || undefined,
        usrMail: extra.buyerEmail || undefined,
        api3d: api3d ? 1 : undefined,
      }),
    });
    const result = await cr.json();

    // 3D 驗證:回導轉網址,交易結果之後走 NotifyURL(payment-callback)開通
    if (result.url3d) return json({ need3d: true, url: result.url3d, status: result.status });

    if (result.ok && result.envelope?.EncryptInfo) {
      // 把 PayUni 原始封包原封轉發給 payment-callback → 沿用開通(callback 冪等:防重放/已付款)
      try {
        await fetch(notifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            EncryptInfo: result.envelope.EncryptInfo,
            Status: result.envelope.Status || "SUCCESS",
          }).toString(),
        });
      } catch (e) {
        console.error("轉發 payment-callback 失敗(NotifyURL 仍會補開通):", e);
      }
      return json({ ok: true, tradeNo: result.tradeNo, card4No: result.card4No, message: result.message || "授權成功" });
    }

    return json({ ok: false, status: result.status, message: result.message || "授權失敗，請確認卡片或改用其他卡" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

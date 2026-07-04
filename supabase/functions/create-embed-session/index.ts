// Supabase Edge Function: create-embed-session
// 免跳轉支付元件(UNi Embed) 第一步:驗身分 + 伺服器算價 + 建 pending 訂單 + 向固定IP gateway 取 SDK_Token。
// 回 { orderId, sdkToken } 給前端掛信用卡 iframe。金額全由伺服器決定,前端無法竄改。
// KeyBox 版:itemId = PayGate plan id(keybox:standard:monthly / keybox:premium:monthly),價格向 PayGate 查。

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUser } from "../_shared/require-user.ts";

const GATEWAY_URL = Deno.env.get("PAYUNI_GATEWAY_URL")!;
const GATEWAY_SECRET = Deno.env.get("PAYUNI_GATEWAY_SECRET") || "";
const IFRAME_DOMAIN = Deno.env.get("PAYUNI_IFRAME_DOMAIN") || "https://magic-box-creator.vercel.app";
const PAYGATE_URL = Deno.env.get("PAYGATE_URL") || "";

const ALLOWED_ITEMS = new Set(["keybox:standard:monthly", "keybox:premium:monthly"]);

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
    const { orderId, amount, itemId, itemDesc, buyerEmail, buyerName, userId, iframeDomain } = await req.json();
    if (!orderId || !itemId || !itemDesc || !userId) return json({ error: "缺少必要參數" }, 400);
    if (!GATEWAY_SECRET) return json({ error: "PAYUNI_GATEWAY_SECRET 未設定" }, 500);
    if (!ALLOWED_ITEMS.has(itemId)) return json({ error: "無效的方案" }, 400);

    // 🔒 驗身分:必須登入,且只能替自己建單
    const authed = await requireUser(req);
    if (!authed) return json({ error: "請先登入" }, 401);
    if (userId !== authed.id) return json({ error: "身分驗證失敗" }, 403);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 伺服器端查真實價格(PayGate 方案為唯一來源,別信前端傳來的 amount)
    const expectedAmount = await getServerPrice(itemId);
    if (typeof amount === "number" && amount !== expectedAmount) {
      return json({ error: "金額驗證失敗", detail: `預期 ${expectedAmount}，收到 ${amount}` }, 400);
    }
    if (expectedAmount <= 0) return json({ error: "免跳轉僅支援付費項目(金額>0)" }, 400);

    // 向 gateway 取 SDK_Token(固定IP代打 PayUni token_get)
    const tr = await fetch(`${GATEWAY_URL}/token-get`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-gateway-secret": GATEWAY_SECRET },
      body: JSON.stringify({ iframeDomain: iframeDomain || IFRAME_DOMAIN }),
    });
    const td = await tr.json();
    if (!tr.ok || !td.ok || !td.token) return json({ error: "無法取得支付元件 Token", detail: td.message || null }, 502);

    // 建 pending 訂單(order_id 即 MerTradeNo;SDK_Token 存 extra_data)
    const { error: insErr } = await supabase.from("payment_orders").insert({
      order_id: orderId,
      user_id: userId,
      item_id: itemId,
      amount: expectedAmount,
      status: "pending",
      payment_method: "payuni",
      extra_data: { sdkToken: td.token, itemDesc, buyerEmail: buyerEmail || null, buyerName: buyerName || null },
      created_at: new Date().toISOString(),
    });
    if (insErr) return json({ error: "訂單建立失敗: " + insErr.message }, 500);

    return json({ orderId, sdkToken: td.token, amount: expectedAmount });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

// KeyBox 查價:向 PayGate 拉方案價格(單一價格來源,fail-closed)
async function getServerPrice(planId: string): Promise<number> {
  if (!PAYGATE_URL) throw new Error("PAYGATE_URL 未設定");
  const res = await fetch(`${PAYGATE_URL}/api/plans?product=keybox`);
  if (!res.ok) throw new Error("無法取得方案價格");
  const { plans } = await res.json();
  const plan = (plans || []).find((p: { id: string }) => p.id === planId);
  return typeof plan?.price === "number" ? plan.price : 0;
}

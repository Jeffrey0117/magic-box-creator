// Supabase Edge Function: payment-callback
// PAYUNi 付款回調(NotifyURL / embed-charge 轉發)。
// ⚠️ 部署時必須 verify_jwt=false(PayUni 不帶 JWT),已設定於 supabase/config.toml。
// 冪等:webhook_requests.trade_no unique 防重放;已付款訂單直接跳過。
// 開通:payment_orders → paid,升級 user_profiles.membership_tier,並登記 PayGate 訂閱(管到期)。

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// 金鑰只從環境變數讀(缺就解不了密,fail-closed;絕不寫死金鑰在程式碼)
const MerKey = Deno.env.get("PAYUNI_HASH_KEY") || "";
const MerIV = Deno.env.get("PAYUNI_HASH_IV") || "";
const PAYGATE_URL = Deno.env.get("PAYGATE_URL") || "";
const PAYGATE_TOKEN = Deno.env.get("PAYGATE_TOKEN") || "";

const VALID_TIERS = new Set(["standard", "premium"]);

// AES-256-GCM 解密:EncryptInfo = hex( base64(ct) + ":::" + base64(tag) )
async function decryptEncryptInfo(encryptedHex: string): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const hexBytes = new Uint8Array(encryptedHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  const combinedStr = decoder.decode(hexBytes);

  const separatorIndex = combinedStr.lastIndexOf(":::");
  if (separatorIndex === -1) throw new Error("Invalid format: no separator");

  const ciphertextBase64 = combinedStr.substring(0, separatorIndex);
  const tagBase64 = combinedStr.substring(separatorIndex + 3);

  const ciphertextStr = atob(ciphertextBase64);
  const ciphertext = new Uint8Array(ciphertextStr.length);
  for (let i = 0; i < ciphertextStr.length; i++) ciphertext[i] = ciphertextStr.charCodeAt(i);

  const tagStr = atob(tagBase64);
  const tag = new Uint8Array(tagStr.length);
  for (let i = 0; i < tagStr.length; i++) tag[i] = tagStr.charCodeAt(i);

  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);

  const key = await crypto.subtle.importKey("raw", encoder.encode(MerKey), { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: encoder.encode(MerIV), tagLength: 128 },
    key,
    combined,
  );

  const queryString = decoder.decode(decrypted);
  const params: Record<string, string> = {};
  queryString.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (k && v !== undefined) params[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return params;
}

// 冪等:trade_no unique,撞到就是重放 → 跳過
async function claimWebhook(supabase: SupabaseClient, tradeNo: string): Promise<boolean> {
  const { error } = await supabase.from("webhook_requests").insert({ trade_no: tradeNo, status: "processing" });
  if (error) {
    if (error.code === "23505") return false; // duplicate
    throw error;
  }
  return true;
}

// 開通會員:直接升級 user_profiles(即時生效)+ 登記 PayGate 訂閱(管 30 天到期/續約帳本)
async function activateMembership(supabase: SupabaseClient, order: { user_id: string; item_id: string }) {
  const tier = String(order.item_id).split(":")[1] || "";
  if (!VALID_TIERS.has(tier)) {
    console.error(`[callback] 未知方案 tier: ${order.item_id}`);
    return;
  }

  const { error: upErr } = await supabase
    .from("user_profiles")
    .upsert({ id: order.user_id, membership_tier: tier, updated_at: new Date().toISOString() });
  if (upErr) console.error("[callback] 升級 membership_tier 失敗:", upErr.message);
  else console.log(`[callback] membership_tier → ${tier} (user ${order.user_id})`);

  // PayGate 訂閱帳本(到期由 PayGate expire-check 降級);失敗不擋開通
  if (!PAYGATE_TOKEN || !PAYGATE_URL) {
    console.warn("[callback] PAYGATE_URL / PAYGATE_TOKEN 未設定,略過 PayGate 訂閱登記(到期不會自動降級)");
    return;
  }
  try {
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(order.user_id);
    const email = userData?.user?.email;
    if (userErr || !email) throw new Error(userErr?.message || "找不到使用者 email");

    const res = await fetch(`${PAYGATE_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PAYGATE_TOKEN}` },
      body: JSON.stringify({ email, product: "keybox", plan_id: order.item_id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`PayGate ${res.status}: ${JSON.stringify(body)}`);
    console.log(`[callback] PayGate 訂閱已登記: ${email} → ${order.item_id}`);
  } catch (e) {
    console.error("[callback] PayGate 訂閱登記失敗(會員已直接開通,請人工補登):", (e as Error).message);
  }
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!MerKey || !MerIV) {
    console.error("[callback] PAYUNI_HASH_KEY / PAYUNI_HASH_IV 未設定");
    return new Response("Not configured", { status: 500 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let encryptInfo = "";
    let outerStatus = "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      encryptInfo = body.EncryptInfo || "";
      outerStatus = body.Status || "";
    } else {
      const form = await req.formData();
      encryptInfo = String(form.get("EncryptInfo") || "");
      outerStatus = String(form.get("Status") || "");
    }
    if (!encryptInfo) return new Response("No EncryptInfo", { status: 400 });

    const params = await decryptEncryptInfo(encryptInfo);
    const orderId = params.MerTradeNo || "";
    const status = params.Status || outerStatus || "";
    const tradeNo = params.TradeNo || params.PeriodTradeNo || "";
    console.log(`[callback] Order: ${orderId}, Status: ${status}, TradeNo: ${tradeNo}`);

    if (!orderId) return new Response("No order ID", { status: 400 });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 冪等 ①:同一筆 PayUni 交易只處理一次
    if (tradeNo) {
      const fresh = await claimWebhook(supabase, tradeNo);
      if (!fresh) {
        console.log(`[callback] 重複 TradeNo,跳過: ${tradeNo}`);
        return new Response("OK (duplicate)", { status: 200 });
      }
    }

    const { data: order, error: orderErr } = await supabase
      .from("payment_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();
    if (orderErr || !order) {
      console.error(`[callback] 訂單不存在: ${orderId}`);
      return new Response("Order not found", { status: 404 });
    }

    // 冪等 ②:已付款直接跳過
    if (order.status === "paid") return new Response("Order already paid", { status: 200 });

    const isSuccess = status === "SUCCESS" || status === "OK";
    if (!isSuccess) {
      await supabase
        .from("payment_orders")
        .update({ status: "failed", extra_data: { ...order.extra_data, payuniStatus: status, payuniMessage: params.Message || "" } })
        .eq("order_id", orderId);
      console.log(`[callback] 付款失敗: ${orderId} (${status})`);
      return new Response("OK", { status: 200 });
    }

    // 金額比對(防封包被調包)
    const paidAmt = parseInt(params.TradeAmt || "0", 10);
    if (paidAmt > 0 && paidAmt !== order.amount) {
      console.error(`[callback] 金額不符: 訂單 ${order.amount},實付 ${paidAmt} (${orderId})`);
      return new Response("Amount mismatch", { status: 400 });
    }

    const { error: updErr } = await supabase
      .from("payment_orders")
      .update({
        status: "paid",
        extra_data: { ...order.extra_data, tradeNo, paidAt: new Date().toISOString(), card4No: params.Card4No || null },
      })
      .eq("order_id", orderId);
    if (updErr) {
      console.error("[callback] 更新訂單失敗:", updErr.message);
      return new Response("Error: " + updErr.message, { status: 500 });
    }

    await activateMembership(supabase, order);

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("[callback]", (e as Error).message);
    return new Response("Error: " + (e as Error).message, { status: 500 });
  }
});

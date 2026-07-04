-- PayUni 免跳轉金流:最小訂單表 + webhook 冪等表(payuni-embed-kit 樣板)
-- order_id 即 PayUni 的 MerTradeNo(唯一,KeyBox 前綴 KB)

create table if not exists payment_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,            -- = MerTradeNo
  user_id uuid not null,
  item_id text not null,                    -- PayGate plan id(keybox:standard:monthly / keybox:premium:monthly)
  amount integer not null,                  -- 伺服器算出的金額(整數 TWD)
  status text not null default 'pending',   -- pending | paid | failed
  payment_method text default 'payuni',
  extra_data jsonb default '{}'::jsonb,      -- sdkToken / itemDesc / buyerEmail / tradeNo…
  created_at timestamptz not null default now()
);

-- webhook 冪等:payment-callback 用它防重放/重複開通(進來先 insert,撞 unique 就跳過)
create table if not exists webhook_requests (
  id uuid primary key default gen_random_uuid(),
  trade_no text not null unique,
  status text,
  created_at timestamptz not null default now()
);

alter table payment_orders enable row level security;
create policy payment_orders_owner_read on payment_orders
  for select using (auth.uid() = user_id);
-- 寫入一律走 edge function(service role bypass RLS),前端不直接寫。

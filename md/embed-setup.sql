-- ============================================================
-- KeyBox Embed SDK 啟用 SQL（貼進 Supabase Dashboard → SQL Editor 跑一次）
-- 內容：① embed/webhook migration ② 建「AI 彎道超車資源包」box
-- ============================================================

-- ① migration（與 repo 的 20260607100000_add_embed_and_webhook.sql 相同）
alter table public.keywords
  add column if not exists unlock_mode text not null default 'keyword',
  add column if not exists webhook_url text null,
  add column if not exists webhook_secret text null;

comment on column public.keywords.unlock_mode is 'keyword = require keyword input; email = email-only gate (embed resource packs)';
comment on column public.keywords.webhook_url is 'POST target fired on new unlock: {event, box, email, name, ts} HMAC-signed via x-keybox-signature';
comment on column public.keywords.webhook_secret is 'HMAC-SHA256 secret for webhook signature';

create index if not exists idx_email_logs_keyword_email on public.email_logs (keyword_id, email);

-- ② 建 box：AI 彎道超車資源包（email-only gate + webhook 回流 freesource）
insert into public.keywords
  (creator_id, keyword, short_code, package_title, package_description, content,
   unlock_mode, webhook_url, webhook_secret)
select
  u.id,
  'ai-chaoche',
  'aichaoche',
  'AI 彎道超車資源包',
  '吳恩達《AI for Everyone》＋ AI Agent 課程筆記——兩份 PDF ＋ 一部影片，填信箱直接領。',
  E'📘 普通人 AI 彎道超車筆記（PDF）\nhttps://freesource.isnowfriend.com/uploads/mq3eg173-7314bdf4-ai-chaoche-notes.pdf\n\n📗 AI Agent Blueprint 完整筆記（PDF，19MB）\nhttps://freesource.isnowfriend.com/uploads/ai-agent-blueprint.pdf\n\n🎬 加碼：AI Agent 智能體大師課（影片，47MB）\nhttps://freesource.isnowfriend.com/uploads/ai-agent-master-class.mp4',
  'email',
  'https://freesource.isnowfriend.com/api/webhooks/keybox?site=freesource',
  '24fb1f120256a26bfdbcfde48e933b3b2cf13ff1e5f94018688350ed07564e9d'
from auth.users u
where u.email = 'jeffby8@gmail.com'
on conflict (creator_id, keyword) do nothing;

-- 確認建好了
select short_code, package_title, unlock_mode, webhook_url is not null as has_webhook
from public.keywords where short_code = 'aichaoche';

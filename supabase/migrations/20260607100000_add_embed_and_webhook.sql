-- Embed SDK + webhook support
-- unlock_mode: 'keyword' (default, existing behavior) | 'email' (no keyword needed — pure email gate for embeds)
-- webhook_url/secret: per-box outbound webhook fired on each NEW unlock (HMAC-SHA256 signed)
alter table public.keywords
  add column if not exists unlock_mode text not null default 'keyword',
  add column if not exists webhook_url text null,
  add column if not exists webhook_secret text null;

comment on column public.keywords.unlock_mode is 'keyword = require keyword input; email = email-only gate (embed resource packs)';
comment on column public.keywords.webhook_url is 'POST target fired on new unlock: {event, box, email, name, ts} HMAC-signed via x-keybox-signature';
comment on column public.keywords.webhook_secret is 'HMAC-SHA256 secret for webhook signature';

-- speed up the claims lookups the embed API does on every unlock
create index if not exists idx_email_logs_keyword_email on public.email_logs (keyword_id, email);

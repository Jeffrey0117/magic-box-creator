-- Add hide_author_info column to keywords (packages)
alter table public.keywords
add column if not exists hide_author_info boolean not null default false;
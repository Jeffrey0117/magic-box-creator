-- Phase 3: 正規化多關鍵字規則至獨立資料表 unlock_rules，並自 keywords.unlock_rule_json 遷移資料

-- 1) 建立 unlock_rules 資料表
create table if not exists public.unlock_rules (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.keywords(id) on delete cascade,
  name text null,
  keywords text[] not null,
  match_mode text not null check (match_mode in ('AND','OR','ORDER')),
  quota integer null,
  start_at timestamptz null,
  end_at timestamptz null,
  error_message text null,
  created_at timestamptz not null default now()
);

comment on table public.unlock_rules is 'Normalized multi-keyword unlock rules per package (keywords row)';
comment on column public.unlock_rules.package_id is 'FK to keywords.id';
comment on column public.unlock_rules.keywords is 'Keywords list for matching (lowest-cased client-side)';
comment on column public.unlock_rules.match_mode is 'AND|OR|ORDER';
comment on column public.unlock_rules.quota is 'Optional per-rule quota';
comment on column public.unlock_rules.start_at is 'Optional rule valid-from time';
comment on column public.unlock_rules.end_at is 'Optional rule valid-until time';
comment on column public.unlock_rules.error_message is 'Optional custom error message';

-- 2) 索引
create index if not exists idx_unlock_rules_package_id on public.unlock_rules(package_id);
create index if not exists idx_unlock_rules_timewin on public.unlock_rules using btree (start_at, end_at);

-- 3) 啟用 RLS
alter table public.unlock_rules enable row level security;

-- 4) RLS 策略
-- 4.1 任何人可讀取與公開可見的 package 關聯之規則（沿用 keywords 既有公開讀取邏輯）
do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'unlock_rules_select_public' and tablename = 'unlock_rules'
  ) then
    create policy unlock_rules_select_public
      on public.unlock_rules
      for select
      using (
        exists (
          select 1
          from public.keywords k
          where k.id = unlock_rules.package_id
        )
      );
  end if;
end $$;

-- 4.2 僅創作者本人可對自己 package 的規則進行寫入/修改/刪除
do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'unlock_rules_write_owner' and tablename = 'unlock_rules'
  ) then
    create policy unlock_rules_write_owner
      on public.unlock_rules
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.keywords k
          where k.id = unlock_rules.package_id
            and k.creator_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.keywords k
          where k.id = unlock_rules.package_id
            and k.creator_id = auth.uid()
        )
      );
  end if;
end $$;

-- 5) 從 JSON 欄位進行一次性資料遷移（保持向後相容，不刪 JSON）
-- 將 keywords.unlock_rule_json 的每個規則展平成 unlock_rules 列
-- 僅在目前 unlock_rules 對應 package 尚無任何資料時才遷移，避免重複
with packages_with_json as (
  select k.id as package_id, k.unlock_rule_json
  from public.keywords k
  where k.unlock_rule_enabled = true
    and k.unlock_rule_json is not null
),
to_migrate as (
  select p.package_id, jsonb_array_elements(p.unlock_rule_json) as rule
  from packages_with_json p
  where not exists (
    select 1 from public.unlock_rules ur where ur.package_id = p.package_id
  )
)
insert into public.unlock_rules (
  package_id,
  name,
  keywords,
  match_mode,
  quota,
  start_at,
  end_at,
  error_message
)
select
  t.package_id,
  nullif(trim((t.rule ->> 'name')), '') as name,
  coalesce(
    (select array_agg(val)
     from (
       select jsonb_array_elements_text(t.rule -> 'keywords') as val
     ) s
    ),
    array[]::text[]
  ) as keywords,
  case upper(coalesce(t.rule ->> 'matchMode', 'AND'))
    when 'AND' then 'AND'
    when 'OR' then 'OR'
    when 'ORDER' then 'ORDER'
    else 'AND'
  end as match_mode,
  nullif((t.rule ->> 'quota'), '')::int as quota,
  (case when nullif(t.rule ->> 'startAt', '') is null then null else (t.rule ->> 'startAt')::timestamptz end) as start_at,
  (case when nullif(t.rule ->> 'endAt', '') is null then null else (t.rule ->> 'endAt')::timestamptz end) as end_at,
  nullif(trim((t.rule ->> 'errorMessage')), '') as error_message
from to_migrate t;

-- 6) 向後相容說明：
-- - 不移除 keywords.unlock_rule_json / unlock_rule_enabled
-- - 前端可優先讀取 unlock_rules，若無資料則回退至 JSON 欄位
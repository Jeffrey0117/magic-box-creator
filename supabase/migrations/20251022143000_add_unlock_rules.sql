-- Add advanced unlock rules columns to keywords table
alter table public.keywords
  add column if not exists unlock_rule_json jsonb null,
  add column if not exists unlock_rule_enabled boolean not null default false;

comment on column public.keywords.unlock_rule_json is 'Array of rule objects: [{id,name,keywords[],matchMode(AND|OR|ORDER),errorMessage}]';
comment on column public.keywords.unlock_rule_enabled is 'Enable advanced multi-keyword rules';
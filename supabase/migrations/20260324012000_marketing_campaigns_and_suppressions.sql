create table if not exists public.crm_marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  status text not null default 'planning' check (status in ('planning', 'active', 'completed', 'archived')),
  objective text not null default '',
  owner_name text,
  event_id uuid references public.crm_events(id) on delete set null,
  event_name text not null default '',
  template_id uuid references public.crm_templates(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_suppressions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.crm_contacts(id) on delete set null,
  email text not null,
  reason text not null check (reason in ('hard_bounce', 'complaint', 'unsubscribe', 'manual_block', 'soft_bounce')),
  source_provider text check (source_provider in ('resend', 'mailgun', 'kumomta', 'manual')),
  source_broadcast_id uuid references public.crm_campaigns(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'cleared')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_campaigns
add column if not exists marketing_campaign_id uuid references public.crm_marketing_campaigns(id) on delete set null;

create index if not exists crm_marketing_campaigns_status_idx on public.crm_marketing_campaigns(status);
create index if not exists crm_marketing_campaigns_event_idx on public.crm_marketing_campaigns(event_id);
create index if not exists crm_marketing_campaigns_template_idx on public.crm_marketing_campaigns(template_id);
create index if not exists crm_campaigns_marketing_campaign_idx on public.crm_campaigns(marketing_campaign_id);
create index if not exists crm_suppressions_email_idx on public.crm_suppressions(email);
create index if not exists crm_suppressions_contact_idx on public.crm_suppressions(contact_id);
create index if not exists crm_suppressions_broadcast_idx on public.crm_suppressions(source_broadcast_id);
create index if not exists crm_suppressions_status_idx on public.crm_suppressions(status);

drop trigger if exists crm_marketing_campaigns_set_updated_at on public.crm_marketing_campaigns;
create trigger crm_marketing_campaigns_set_updated_at
before update on public.crm_marketing_campaigns
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_suppressions_set_updated_at on public.crm_suppressions;
create trigger crm_suppressions_set_updated_at
before update on public.crm_suppressions
for each row execute procedure public.crm_set_updated_at();

grant select, insert, update, delete on public.crm_marketing_campaigns to anon, authenticated;
grant select, insert, update, delete on public.crm_suppressions to anon, authenticated;

alter table public.crm_marketing_campaigns enable row level security;
alter table public.crm_suppressions enable row level security;

drop policy if exists crm_marketing_campaigns_all on public.crm_marketing_campaigns;
create policy crm_marketing_campaigns_all on public.crm_marketing_campaigns for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_suppressions_all on public.crm_suppressions;
create policy crm_suppressions_all on public.crm_suppressions for all to anon, authenticated using (true) with check (true);

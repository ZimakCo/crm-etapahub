create table if not exists public.crm_email_domains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  provider text not null check (provider in ('resend', 'mailgun', 'kumomta', 'manual')),
  status text not null default 'verified' check (status in ('verified', 'warming', 'attention')),
  region text not null default '',
  tracking text not null default 'enabled' check (tracking in ('enabled', 'partial', 'disabled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_sender_identities (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('resend', 'mailgun', 'kumomta', 'manual')),
  from_name text not null default '',
  email text not null unique,
  reply_to text not null default '',
  domain_id uuid not null references public.crm_email_domains(id) on delete cascade,
  region text not null default '',
  status text not null default 'active' check (status in ('active', 'warmup', 'paused')),
  volume_band text not null default '',
  purpose text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('resend', 'mailgun', 'kumomta', 'manual')),
  label text not null default '',
  url text not null unique,
  status text not null default 'healthy' check (status in ('healthy', 'warming', 'error')),
  events text[] not null default '{}',
  notes text,
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.crm_campaigns
add column if not exists sender_identity_id uuid references public.crm_sender_identities(id) on delete set null;

create index if not exists crm_email_domains_provider_idx on public.crm_email_domains(provider);
create index if not exists crm_sender_identities_domain_idx on public.crm_sender_identities(domain_id);
create index if not exists crm_sender_identities_provider_idx on public.crm_sender_identities(provider);
create index if not exists crm_webhook_endpoints_provider_idx on public.crm_webhook_endpoints(provider);
create index if not exists crm_campaigns_sender_identity_idx on public.crm_campaigns(sender_identity_id);

drop trigger if exists crm_email_domains_set_updated_at on public.crm_email_domains;
create trigger crm_email_domains_set_updated_at
before update on public.crm_email_domains
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_sender_identities_set_updated_at on public.crm_sender_identities;
create trigger crm_sender_identities_set_updated_at
before update on public.crm_sender_identities
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_webhook_endpoints_set_updated_at on public.crm_webhook_endpoints;
create trigger crm_webhook_endpoints_set_updated_at
before update on public.crm_webhook_endpoints
for each row execute procedure public.crm_set_updated_at();

grant select, insert, update, delete on public.crm_email_domains to anon, authenticated;
grant select, insert, update, delete on public.crm_sender_identities to anon, authenticated;
grant select, insert, update, delete on public.crm_webhook_endpoints to anon, authenticated;

alter table public.crm_email_domains enable row level security;
alter table public.crm_sender_identities enable row level security;
alter table public.crm_webhook_endpoints enable row level security;

drop policy if exists crm_email_domains_all on public.crm_email_domains;
create policy crm_email_domains_all on public.crm_email_domains for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_sender_identities_all on public.crm_sender_identities;
create policy crm_sender_identities_all on public.crm_sender_identities for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_webhook_endpoints_all on public.crm_webhook_endpoints;
create policy crm_webhook_endpoints_all on public.crm_webhook_endpoints for all to anon, authenticated using (true) with check (true);

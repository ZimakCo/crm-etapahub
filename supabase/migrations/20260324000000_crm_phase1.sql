create extension if not exists pgcrypto;

create or replace function public.crm_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.crm_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text not null default '',
  city text not null default '',
  country text not null default '',
  postal_code text not null default '',
  vat_id text,
  tax_id text,
  industry text,
  website text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null,
  last_name text not null,
  company_id uuid references public.crm_companies(id) on delete set null,
  company_name text not null default '',
  job_title text not null default '',
  phone text not null default '',
  linkedin text not null default '',
  country text not null default '',
  city text not null default '',
  industry text not null default '',
  company_size text not null default '',
  lead_source text not null default '',
  tags text[] not null default '{}',
  contact_type text not null default 'lead' check (contact_type in ('lead', 'client', 'subscriber', 'delegate', 'employee', 'sponsor')),
  owner_name text,
  brochure_status text not null default 'not_requested' check (brochure_status in ('not_requested', 'requested', 'sent')),
  notes text,
  email_status text not null default 'unknown' check (email_status in ('valid', 'invalid', 'unknown', 'catch-all', 'spam')),
  subscription_status text not null default 'subscribed' check (subscription_status in ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  last_activity_at timestamptz not null default now(),
  last_reply_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  type text not null check (
    type in (
      'email_sent',
      'email_opened',
      'email_clicked',
      'email_replied',
      'email_bounced',
      'campaign_added',
      'segment_added',
      'segment_removed',
      'event_registered',
      'event_attended',
      'event_no_show',
      'note_added',
      'tag_added',
      'tag_removed',
      'contact_created',
      'contact_updated'
    )
  ),
  title text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by text not null default 'CRM'
);

create table if not exists public.crm_segments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  rule_groups jsonb not null default '[]'::jsonb,
  group_logic text not null default 'AND' check (group_logic in ('AND', 'OR')),
  is_active boolean not null default true,
  segment_kind text not null default 'manual' check (segment_kind in ('manual', 'dynamic', 'campaign', 'event')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_calculated_at timestamptz not null default now()
);

create table if not exists public.crm_segment_contacts (
  segment_id uuid not null references public.crm_segments(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (segment_id, contact_id)
);

create table if not exists public.crm_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  format text not null default 'plain_text' check (format in ('plain_text', 'html')),
  subject text not null default '',
  preview_text text not null default '',
  text_content text,
  html_content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_id uuid references public.crm_templates(id) on delete set null,
  provider text not null default 'resend',
  subject text not null default '',
  preview_text text not null default '',
  from_name text not null default '',
  from_email text not null default '',
  reply_to text not null default '',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  notes text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_campaign_segments (
  campaign_id uuid not null references public.crm_campaigns(id) on delete cascade,
  segment_id uuid not null references public.crm_segments(id) on delete cascade,
  primary key (campaign_id, segment_id)
);

create table if not exists public.crm_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.crm_campaigns(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  email text not null,
  delivery_status text not null default 'queued' check (delivery_status in ('queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed', 'complained', 'spam')),
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  bounced_at timestamptz,
  unsubscribed_at timestamptz,
  complained_at timestamptz,
  last_event_at timestamptz,
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign_id, contact_id)
);

create table if not exists public.crm_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('conference', 'webinar', 'workshop', 'meetup', 'trade_show')),
  date date not null,
  location text not null default '',
  description text not null default '',
  capacity integer not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.crm_events(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  status text not null default 'registered' check (status in ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
  registered_at timestamptz not null default now(),
  confirmed_at timestamptz,
  attended_at timestamptz,
  notes text,
  unique (event_id, contact_id)
);

create table if not exists public.crm_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.crm_events(id) on delete cascade,
  event_name text not null,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  contact_name text not null,
  contact_email text not null,
  company_id uuid references public.crm_companies(id) on delete set null,
  company_name text not null default '',
  ticket_type text not null check (ticket_type in ('standard', 'vip', 'speaker', 'sponsor', 'exhibitor', 'press', 'staff')),
  ticket_price numeric(12, 2) not null default 0,
  currency text not null check (currency in ('EUR', 'USD', 'GBP', 'CHF')),
  quantity integer not null default 1,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'waitlist')),
  registered_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  invoice_id uuid,
  additional_attendees jsonb not null default '[]'::jsonb,
  admin_notes text,
  special_requirements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  invoice_date date not null,
  due_date date not null,
  status text not null default 'draft' check (status in ('draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded')),
  registration_id uuid references public.crm_registrations(id) on delete set null,
  event_id uuid references public.crm_events(id) on delete set null,
  event_name text not null default '',
  contact_id uuid references public.crm_contacts(id) on delete set null,
  contact_name text not null default '',
  contact_email text not null default '',
  company_id uuid references public.crm_companies(id) on delete set null,
  company_name text not null default '',
  subtotal numeric(12, 2) not null default 0,
  tax_rate numeric(8, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  currency text not null check (currency in ('EUR', 'USD', 'GBP', 'CHF')),
  amount_paid numeric(12, 2) not null default 0,
  balance_due numeric(12, 2) not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partially_paid', 'paid', 'refunded', 'cancelled')),
  admin_notes text,
  public_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  total_price numeric(12, 2) not null default 0
);

create table if not exists public.crm_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.crm_invoices(id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  currency text not null check (currency in ('EUR', 'USD', 'GBP', 'CHF')),
  payment_date timestamptz not null default now(),
  payment_method text not null check (payment_method in ('bank_transfer', 'card', 'cash', 'other')),
  payment_reference text,
  status text not null default 'completed' check (status in ('completed', 'pending', 'failed', 'refunded')),
  notes text,
  created_at timestamptz not null default now(),
  created_by text not null default 'CRM'
);

create index if not exists crm_contacts_company_idx on public.crm_contacts(company_id);
create index if not exists crm_contacts_activity_idx on public.crm_contacts(last_activity_at desc);
create index if not exists crm_contacts_email_idx on public.crm_contacts(email);
create index if not exists crm_activities_contact_idx on public.crm_activities(contact_id, created_at desc);
create index if not exists crm_campaigns_status_idx on public.crm_campaigns(status, created_at desc);
create index if not exists crm_campaign_recipients_campaign_idx on public.crm_campaign_recipients(campaign_id);
create index if not exists crm_campaign_recipients_contact_idx on public.crm_campaign_recipients(contact_id);
create index if not exists crm_events_date_idx on public.crm_events(date desc);
create index if not exists crm_event_participants_event_idx on public.crm_event_participants(event_id);
create index if not exists crm_registrations_event_idx on public.crm_registrations(event_id);
create index if not exists crm_invoices_registration_idx on public.crm_invoices(registration_id);
create index if not exists crm_payments_invoice_idx on public.crm_payments(invoice_id);

drop trigger if exists crm_companies_set_updated_at on public.crm_companies;
create trigger crm_companies_set_updated_at
before update on public.crm_companies
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_contacts_set_updated_at on public.crm_contacts;
create trigger crm_contacts_set_updated_at
before update on public.crm_contacts
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_segments_set_updated_at on public.crm_segments;
create trigger crm_segments_set_updated_at
before update on public.crm_segments
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_templates_set_updated_at on public.crm_templates;
create trigger crm_templates_set_updated_at
before update on public.crm_templates
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_campaigns_set_updated_at on public.crm_campaigns;
create trigger crm_campaigns_set_updated_at
before update on public.crm_campaigns
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_events_set_updated_at on public.crm_events;
create trigger crm_events_set_updated_at
before update on public.crm_events
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_registrations_set_updated_at on public.crm_registrations;
create trigger crm_registrations_set_updated_at
before update on public.crm_registrations
for each row execute procedure public.crm_set_updated_at();

drop trigger if exists crm_invoices_set_updated_at on public.crm_invoices;
create trigger crm_invoices_set_updated_at
before update on public.crm_invoices
for each row execute procedure public.crm_set_updated_at();

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.crm_companies to anon, authenticated;
grant select, insert, update, delete on public.crm_contacts to anon, authenticated;
grant select, insert, update, delete on public.crm_activities to anon, authenticated;
grant select, insert, update, delete on public.crm_segments to anon, authenticated;
grant select, insert, update, delete on public.crm_segment_contacts to anon, authenticated;
grant select, insert, update, delete on public.crm_templates to anon, authenticated;
grant select, insert, update, delete on public.crm_campaigns to anon, authenticated;
grant select, insert, update, delete on public.crm_campaign_segments to anon, authenticated;
grant select, insert, update, delete on public.crm_campaign_recipients to anon, authenticated;
grant select, insert, update, delete on public.crm_events to anon, authenticated;
grant select, insert, update, delete on public.crm_event_participants to anon, authenticated;
grant select, insert, update, delete on public.crm_registrations to anon, authenticated;
grant select, insert, update, delete on public.crm_invoices to anon, authenticated;
grant select, insert, update, delete on public.crm_invoice_line_items to anon, authenticated;
grant select, insert, update, delete on public.crm_payments to anon, authenticated;

alter table public.crm_companies enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_activities enable row level security;
alter table public.crm_segments enable row level security;
alter table public.crm_segment_contacts enable row level security;
alter table public.crm_templates enable row level security;
alter table public.crm_campaigns enable row level security;
alter table public.crm_campaign_segments enable row level security;
alter table public.crm_campaign_recipients enable row level security;
alter table public.crm_events enable row level security;
alter table public.crm_event_participants enable row level security;
alter table public.crm_registrations enable row level security;
alter table public.crm_invoices enable row level security;
alter table public.crm_invoice_line_items enable row level security;
alter table public.crm_payments enable row level security;

drop policy if exists crm_companies_all on public.crm_companies;
create policy crm_companies_all on public.crm_companies for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_contacts_all on public.crm_contacts;
create policy crm_contacts_all on public.crm_contacts for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_activities_all on public.crm_activities;
create policy crm_activities_all on public.crm_activities for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_segments_all on public.crm_segments;
create policy crm_segments_all on public.crm_segments for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_segment_contacts_all on public.crm_segment_contacts;
create policy crm_segment_contacts_all on public.crm_segment_contacts for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_templates_all on public.crm_templates;
create policy crm_templates_all on public.crm_templates for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_campaigns_all on public.crm_campaigns;
create policy crm_campaigns_all on public.crm_campaigns for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_campaign_segments_all on public.crm_campaign_segments;
create policy crm_campaign_segments_all on public.crm_campaign_segments for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_campaign_recipients_all on public.crm_campaign_recipients;
create policy crm_campaign_recipients_all on public.crm_campaign_recipients for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_events_all on public.crm_events;
create policy crm_events_all on public.crm_events for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_event_participants_all on public.crm_event_participants;
create policy crm_event_participants_all on public.crm_event_participants for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_registrations_all on public.crm_registrations;
create policy crm_registrations_all on public.crm_registrations for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_invoices_all on public.crm_invoices;
create policy crm_invoices_all on public.crm_invoices for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_invoice_line_items_all on public.crm_invoice_line_items;
create policy crm_invoice_line_items_all on public.crm_invoice_line_items for all to anon, authenticated using (true) with check (true);

drop policy if exists crm_payments_all on public.crm_payments;
create policy crm_payments_all on public.crm_payments for all to anon, authenticated using (true) with check (true);

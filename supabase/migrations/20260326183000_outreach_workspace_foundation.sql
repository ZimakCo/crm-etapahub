create table if not exists public.crm_outreach_mailboxes (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  owner_email text not null,
  provider text not null check (provider in ('google_workspace', 'microsoft_365', 'outlook')),
  mailbox_email text not null unique,
  display_name text not null,
  connection_status text not null default 'paused' check (connection_status in ('connected', 'attention', 'paused')),
  sending_health text not null default 'paused' check (sending_health in ('healthy', 'warming', 'at_risk', 'paused')),
  daily_limit integer not null default 0 check (daily_limit >= 0),
  last_sync_at timestamptz,
  oauth_connected_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_outreach_templates (
  id uuid primary key default gen_random_uuid(),
  owner_name text,
  name text not null,
  category text not null default 'custom' check (category in ('intro', 'follow_up', 're_engage', 'meeting', 'custom')),
  subject text not null default '',
  plain_text_body text not null default '',
  html_body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_outreach_sequences (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  name text not null,
  status text not null default 'draft' check (status in ('active', 'draft', 'paused', 'completed')),
  description text not null default '',
  stop_on_reply boolean not null default true,
  stop_on_interested boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_name, name)
);

create table if not exists public.crm_outreach_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.crm_outreach_sequences(id) on delete cascade,
  step_order integer not null check (step_order > 0),
  step_type text not null check (step_type in ('automatic_email', 'manual_email', 'call', 'task', 'linkedin')),
  title text not null,
  delay_days integer not null default 0 check (delay_days >= 0),
  template_id uuid references public.crm_outreach_templates(id) on delete set null,
  priority text check (priority in ('high', 'medium', 'low')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sequence_id, step_order)
);

create table if not exists public.crm_outreach_sequence_contacts (
  sequence_id uuid not null references public.crm_outreach_sequences(id) on delete cascade,
  contact_id uuid not null references public.crm_contacts(id) on delete cascade,
  mailbox_id uuid references public.crm_outreach_mailboxes(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'removed')),
  current_step_order integer not null default 1 check (current_step_order > 0),
  enrolled_at timestamptz not null default now(),
  paused_until timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  primary key (sequence_id, contact_id)
);

create table if not exists public.crm_outreach_threads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.crm_contacts(id) on delete set null,
  mailbox_id uuid not null references public.crm_outreach_mailboxes(id) on delete cascade,
  sequence_id uuid references public.crm_outreach_sequences(id) on delete set null,
  owner_name text not null,
  status text not null default 'active' check (status in ('active', 'waiting', 'needs_reply', 'bounced', 'completed')),
  last_event text not null default 'sent' check (last_event in ('sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced')),
  unread_count integer not null default 0 check (unread_count >= 0),
  subject text not null default '',
  preview text not null default '',
  last_activity_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_outreach_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.crm_outreach_threads(id) on delete cascade,
  direction text not null check (direction in ('outbound', 'inbound', 'system')),
  subject text not null default '',
  body text not null default '',
  event text check (event in ('sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced')),
  mailbox_id uuid references public.crm_outreach_mailboxes(id) on delete set null,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.crm_outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.crm_contacts(id) on delete set null,
  thread_id uuid references public.crm_outreach_threads(id) on delete set null,
  sequence_id uuid references public.crm_outreach_sequences(id) on delete set null,
  owner_name text not null,
  title text not null,
  task_type text not null check (task_type in ('call', 'manual_email', 'action_item', 'linkedin')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'open' check (status in ('open', 'completed', 'skipped')),
  due_at timestamptz not null default now(),
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_outreach_mailboxes_owner_email_idx
  on public.crm_outreach_mailboxes (owner_email);

create index if not exists crm_outreach_sequence_contacts_mailbox_id_idx
  on public.crm_outreach_sequence_contacts (mailbox_id);

create index if not exists crm_outreach_threads_contact_id_idx
  on public.crm_outreach_threads (contact_id);

create index if not exists crm_outreach_threads_mailbox_id_idx
  on public.crm_outreach_threads (mailbox_id);

create index if not exists crm_outreach_threads_sequence_id_idx
  on public.crm_outreach_threads (sequence_id);

create index if not exists crm_outreach_threads_last_activity_idx
  on public.crm_outreach_threads (last_activity_at desc);

create index if not exists crm_outreach_messages_thread_id_sent_at_idx
  on public.crm_outreach_messages (thread_id, sent_at desc);

create index if not exists crm_outreach_tasks_due_at_idx
  on public.crm_outreach_tasks (due_at);

create index if not exists crm_outreach_tasks_sequence_id_idx
  on public.crm_outreach_tasks (sequence_id);

create index if not exists crm_outreach_tasks_thread_id_idx
  on public.crm_outreach_tasks (thread_id);

create index if not exists crm_outreach_tasks_contact_id_idx
  on public.crm_outreach_tasks (contact_id);

alter table public.crm_outreach_mailboxes enable row level security;
alter table public.crm_outreach_templates enable row level security;
alter table public.crm_outreach_sequences enable row level security;
alter table public.crm_outreach_sequence_steps enable row level security;
alter table public.crm_outreach_sequence_contacts enable row level security;
alter table public.crm_outreach_threads enable row level security;
alter table public.crm_outreach_messages enable row level security;
alter table public.crm_outreach_tasks enable row level security;

drop trigger if exists crm_outreach_mailboxes_set_updated_at on public.crm_outreach_mailboxes;
create trigger crm_outreach_mailboxes_set_updated_at
before update on public.crm_outreach_mailboxes
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_outreach_templates_set_updated_at on public.crm_outreach_templates;
create trigger crm_outreach_templates_set_updated_at
before update on public.crm_outreach_templates
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_outreach_sequences_set_updated_at on public.crm_outreach_sequences;
create trigger crm_outreach_sequences_set_updated_at
before update on public.crm_outreach_sequences
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_outreach_sequence_steps_set_updated_at on public.crm_outreach_sequence_steps;
create trigger crm_outreach_sequence_steps_set_updated_at
before update on public.crm_outreach_sequence_steps
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_outreach_threads_set_updated_at on public.crm_outreach_threads;
create trigger crm_outreach_threads_set_updated_at
before update on public.crm_outreach_threads
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_outreach_tasks_set_updated_at on public.crm_outreach_tasks;
create trigger crm_outreach_tasks_set_updated_at
before update on public.crm_outreach_tasks
for each row execute function public.crm_set_updated_at();

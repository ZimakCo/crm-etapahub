create extension if not exists pg_trgm;

create table if not exists public.crm_contact_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.crm_contact_tags (name, usage_count)
select
  tag_name,
  count(*)::integer as usage_count
from (
  select unnest(tags) as tag_name
  from public.crm_contacts
) tag_rows
where coalesce(tag_name, '') <> ''
group by tag_name
on conflict (name) do update
set
  usage_count = excluded.usage_count,
  updated_at = now();

create index if not exists crm_contact_tags_usage_idx on public.crm_contact_tags (usage_count desc, name asc);
create index if not exists crm_contact_tags_name_trgm_idx on public.crm_contact_tags using gin (name gin_trgm_ops);
create index if not exists crm_contacts_tags_gin_idx on public.crm_contacts using gin (tags);
create index if not exists crm_contacts_first_name_trgm_idx on public.crm_contacts using gin (first_name gin_trgm_ops);
create index if not exists crm_contacts_last_name_trgm_idx on public.crm_contacts using gin (last_name gin_trgm_ops);
create index if not exists crm_contacts_email_trgm_idx on public.crm_contacts using gin (email gin_trgm_ops);
create index if not exists crm_contacts_company_name_trgm_idx on public.crm_contacts using gin (company_name gin_trgm_ops);
create index if not exists crm_contacts_job_title_trgm_idx on public.crm_contacts using gin (job_title gin_trgm_ops);
create index if not exists crm_contacts_subscription_idx on public.crm_contacts (subscription_status);
create index if not exists crm_contacts_email_status_idx on public.crm_contacts (email_status);
create index if not exists crm_contacts_brochure_status_idx on public.crm_contacts (brochure_status);
create index if not exists crm_contacts_owner_name_idx on public.crm_contacts (owner_name);
create index if not exists crm_contacts_last_name_first_name_idx on public.crm_contacts (last_name asc, first_name asc);
create index if not exists crm_segment_contacts_segment_contact_idx on public.crm_segment_contacts (segment_id, contact_id);

drop trigger if exists crm_contact_tags_set_updated_at on public.crm_contact_tags;
create trigger crm_contact_tags_set_updated_at
before update on public.crm_contact_tags
for each row execute procedure public.crm_set_updated_at();

grant select, insert, update, delete on public.crm_contact_tags to anon, authenticated;

alter table public.crm_contact_tags enable row level security;

drop policy if exists crm_contact_tags_all on public.crm_contact_tags;
create policy crm_contact_tags_all on public.crm_contact_tags for all to anon, authenticated using (true) with check (true);

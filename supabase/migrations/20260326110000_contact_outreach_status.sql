alter table public.crm_contacts
  add column if not exists outreach_status text
  not null default 'not_contacted'
  check (outreach_status in (
    'not_contacted',
    'in_communication',
    'in_sequence',
    'replied',
    'interested',
    'not_interested'
  ));

update public.crm_contacts
set outreach_status = case
  when last_reply_at is not null then 'replied'
  when coalesce(nullif(trim(owner_name), ''), '') <> '' and brochure_status <> 'not_requested' then 'in_communication'
  else 'not_contacted'
end
where outreach_status is null
   or outreach_status = 'not_contacted';

create index if not exists crm_contacts_outreach_status_idx
  on public.crm_contacts (outreach_status);

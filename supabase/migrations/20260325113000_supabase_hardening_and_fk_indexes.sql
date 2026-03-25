create or replace function public.crm_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists crm_campaign_segments_segment_idx on public.crm_campaign_segments (segment_id);
create index if not exists crm_campaigns_template_idx on public.crm_campaigns (template_id);
create index if not exists crm_event_participants_contact_idx on public.crm_event_participants (contact_id);
create index if not exists crm_invoice_line_items_invoice_idx on public.crm_invoice_line_items (invoice_id);
create index if not exists crm_invoices_company_idx on public.crm_invoices (company_id);
create index if not exists crm_invoices_contact_idx on public.crm_invoices (contact_id);
create index if not exists crm_invoices_event_idx on public.crm_invoices (event_id);
create index if not exists crm_registrations_company_idx on public.crm_registrations (company_id);
create index if not exists crm_registrations_contact_idx on public.crm_registrations (contact_id);
create index if not exists crm_segment_contacts_contact_idx on public.crm_segment_contacts (contact_id);

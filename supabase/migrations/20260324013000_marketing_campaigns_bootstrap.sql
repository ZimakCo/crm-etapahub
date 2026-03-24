insert into public.crm_marketing_campaigns (
  id, name, slug, status, objective, owner_name, event_id, event_name, template_id, notes, created_at, updated_at
)
values
  (
    '39000000-0000-0000-0000-000000000001',
    'EtapaHub Pharma Summit 2026',
    'etapahub-pharma-summit-2026',
    'active',
    'Drive VIP and delegate registrations for the flagship pharma summit.',
    'Events Desk',
    '50000000-0000-0000-0000-000000000001',
    'EtapaHub Pharma Summit 2026',
    '35000000-0000-0000-0000-000000000001',
    'Main invitation program split across seller-built city segments.',
    '2026-03-08T08:00:00Z',
    '2026-03-22T08:00:00Z'
  ),
  (
    '39000000-0000-0000-0000-000000000002',
    'Brochure Follow-up Q1',
    'brochure-follow-up-q1',
    'active',
    'Follow up brochure requests with delivery-first plain text outreach.',
    'Operations',
    null,
    '',
    '35000000-0000-0000-0000-000000000002',
    'Used for manual seller queues after brochure intent is confirmed.',
    '2026-03-20T12:00:00Z',
    '2026-03-22T12:00:00Z'
  )
on conflict (slug) do update
set
  name = excluded.name,
  status = excluded.status,
  objective = excluded.objective,
  owner_name = excluded.owner_name,
  event_id = excluded.event_id,
  event_name = excluded.event_name,
  template_id = excluded.template_id,
  notes = excluded.notes,
  updated_at = excluded.updated_at;

update public.crm_campaigns
set marketing_campaign_id = '39000000-0000-0000-0000-000000000001'
where id = '40000000-0000-0000-0000-000000000001';

update public.crm_campaigns
set marketing_campaign_id = '39000000-0000-0000-0000-000000000002'
where id = '40000000-0000-0000-0000-000000000002';

insert into public.crm_suppressions (
  id, contact_id, email, reason, source_provider, source_broadcast_id, status, notes, created_at, updated_at
)
values
  (
    '39500000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000005',
    'andrea.bianchi@astrazeneca.com',
    'hard_bounce',
    'resend',
    '40000000-0000-0000-0000-000000000001',
    'active',
    'Hard bounce captured from provider webhook.',
    '2026-03-10T08:02:00Z',
    '2026-03-10T08:02:00Z'
  ),
  (
    '39500000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000004',
    'sophie.meyer@novartis.com',
    'unsubscribe',
    'manual',
    null,
    'active',
    'Manual unsubscribe confirmed by operations.',
    '2026-03-12T15:00:00Z',
    '2026-03-12T15:00:00Z'
  )
on conflict (id) do update
set
  contact_id = excluded.contact_id,
  email = excluded.email,
  reason = excluded.reason,
  source_provider = excluded.source_provider,
  source_broadcast_id = excluded.source_broadcast_id,
  status = excluded.status,
  notes = excluded.notes,
  updated_at = excluded.updated_at;

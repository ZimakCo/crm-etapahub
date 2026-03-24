insert into public.crm_email_domains (
  id, name, provider, status, region, tracking, notes, created_at, updated_at
)
values
  (
    '36000000-0000-0000-0000-000000000001',
    'mail.etapa-conferences.com',
    'resend',
    'verified',
    'Ireland (eu-west-1)',
    'enabled',
    'Primary Resend production domain for event invitations.',
    '2026-03-02T08:00:00Z',
    '2026-03-22T08:00:00Z'
  ),
  (
    '36000000-0000-0000-0000-000000000002',
    'mg.etapahub.com',
    'mailgun',
    'verified',
    'EU Central',
    'enabled',
    'Mailgun domain used for brochure and reminder flows.',
    '2026-02-12T10:30:00Z',
    '2026-03-18T08:00:00Z'
  ),
  (
    '36000000-0000-0000-0000-000000000003',
    'relay.etapahub.net',
    'kumomta',
    'warming',
    'Romania VPS',
    'partial',
    'KumoMTA relay used for supervised overflow.',
    '2026-03-15T07:15:00Z',
    '2026-03-22T08:00:00Z'
  )
on conflict (name) do update
set
  provider = excluded.provider,
  status = excluded.status,
  region = excluded.region,
  tracking = excluded.tracking,
  notes = excluded.notes,
  updated_at = excluded.updated_at;

insert into public.crm_sender_identities (
  id, provider, from_name, email, reply_to, domain_id, region, status, volume_band, purpose, created_at, updated_at
)
values
  (
    '37000000-0000-0000-0000-000000000001',
    'resend',
    'EtapaHub Events',
    'events@mail.etapa-conferences.com',
    'events@mail.etapa-conferences.com',
    '36000000-0000-0000-0000-000000000001',
    'Ireland (eu-west-1)',
    'active',
    '6k-10k/day',
    'Primary summit and conference invitation identity.',
    '2026-03-02T08:00:00Z',
    '2026-03-22T08:00:00Z'
  ),
  (
    '37000000-0000-0000-0000-000000000002',
    'mailgun',
    'Brochure Desk',
    'brochure@mg.etapahub.com',
    'brochure@mg.etapahub.com',
    '36000000-0000-0000-0000-000000000002',
    'EU Central',
    'active',
    '8k-14k/day',
    'Brochure and follow-up identity for engaged contacts.',
    '2026-02-12T10:30:00Z',
    '2026-03-18T08:00:00Z'
  ),
  (
    '37000000-0000-0000-0000-000000000003',
    'kumomta',
    'Operations Routing',
    'ops@relay.etapahub.net',
    'ops@relay.etapahub.net',
    '36000000-0000-0000-0000-000000000003',
    'Romania VPS',
    'warmup',
    '40k-90k/day',
    'Manual overflow routing on the VPS lane.',
    '2026-03-15T07:15:00Z',
    '2026-03-22T08:00:00Z'
  )
on conflict (email) do update
set
  provider = excluded.provider,
  from_name = excluded.from_name,
  reply_to = excluded.reply_to,
  domain_id = excluded.domain_id,
  region = excluded.region,
  status = excluded.status,
  volume_band = excluded.volume_band,
  purpose = excluded.purpose,
  updated_at = excluded.updated_at;

insert into public.crm_webhook_endpoints (
  id, provider, label, url, status, events, notes, last_event_at, created_at, updated_at
)
values
  (
    '38000000-0000-0000-0000-000000000001',
    'resend',
    'Provider Events',
    'https://crm.etapahub.com/api/webhooks/provider-events',
    'healthy',
    '{"delivered","bounced","complained","unsubscribed","clicked"}',
    'Shared endpoint for Resend and Mailgun events.',
    '2026-03-24T10:28:00Z',
    '2026-03-10T08:00:00Z',
    '2026-03-24T10:28:00Z'
  ),
  (
    '38000000-0000-0000-0000-000000000002',
    'kumomta',
    'Kumo Relay Sync',
    'https://crm.etapahub.com/api/webhooks/kumo-sync',
    'warming',
    '{"delivered","bounced"}',
    'Relay sync for the KumoMTA VPS lane.',
    '2026-03-24T09:42:00Z',
    '2026-03-18T08:00:00Z',
    '2026-03-24T09:42:00Z'
  )
on conflict (url) do update
set
  provider = excluded.provider,
  label = excluded.label,
  status = excluded.status,
  events = excluded.events,
  notes = excluded.notes,
  last_event_at = excluded.last_event_at,
  updated_at = excluded.updated_at;

update public.crm_campaigns
set
  sender_identity_id = '37000000-0000-0000-0000-000000000001',
  from_name = 'EtapaHub Events',
  from_email = 'events@mail.etapa-conferences.com',
  reply_to = 'events@mail.etapa-conferences.com',
  provider = 'resend'
where id = '40000000-0000-0000-0000-000000000001';

update public.crm_campaigns
set
  sender_identity_id = '37000000-0000-0000-0000-000000000002',
  from_name = 'Brochure Desk',
  from_email = 'brochure@mg.etapahub.com',
  reply_to = 'brochure@mg.etapahub.com',
  provider = 'mailgun'
where id = '40000000-0000-0000-0000-000000000002';

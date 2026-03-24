insert into public.crm_companies (
  id, name, address, city, country, postal_code, vat_id, industry, website, phone
)
values
  ('10000000-0000-0000-0000-000000000001', 'AstraZeneca', '1 Francis Crick Ave', 'Cambridge', 'United Kingdom', 'CB2 0AA', 'GB123456789', 'Pharmaceuticals', 'https://astrazeneca.com', '+44 1223 555 000'),
  ('10000000-0000-0000-0000-000000000002', 'Novartis AG', 'Lichtstrasse 35', 'Basel', 'Switzerland', '4056', 'CHE-101.234.567', 'Pharmaceuticals', 'https://novartis.com', '+41 61 555 1000'),
  ('10000000-0000-0000-0000-000000000003', 'Johnson & Johnson', 'One Johnson & Johnson Plaza', 'New Brunswick', 'United States', '08933', null, 'Healthcare', 'https://jnj.com', '+1 732 555 2000')
on conflict (id) do nothing;

insert into public.crm_contacts (
  id, email, first_name, last_name, company_id, company_name, job_title, phone, linkedin, country, city, industry, company_size, lead_source, tags, contact_type, owner_name, brochure_status, notes, email_status, subscription_status, last_activity_at, last_reply_at, created_at, updated_at
)
values
  ('20000000-0000-0000-0000-000000000001', 'elena.rossi@astrazeneca.com', 'Elena', 'Rossi', '10000000-0000-0000-0000-000000000001', 'AstraZeneca', 'Head of Medical Affairs', '+44 7700 900001', 'https://linkedin.com/in/elena-rossi', 'United Kingdom', 'Cambridge', 'Pharmaceuticals', '1001-5000', 'CSV Import', '{"pharma-2026-a","vip"}', 'lead', 'Sales Team', 'requested', 'Interested in oncology roundtables.', 'valid', 'subscribed', '2026-03-22T10:10:00Z', '2026-03-18T09:00:00Z', '2026-02-10T09:00:00Z', '2026-03-22T10:10:00Z'),
  ('20000000-0000-0000-0000-000000000002', 'marco.sala@novartis.com', 'Marco', 'Sala', '10000000-0000-0000-0000-000000000002', 'Novartis AG', 'Clinical Operations Director', '+41 79 555 0002', 'https://linkedin.com/in/marco-sala', 'Switzerland', 'Basel', 'Pharmaceuticals', '5000+', 'Referral', '{"pharma-2026-a","speaker-candidate"}', 'client', 'Events Desk', 'sent', 'Already requested sponsorship deck.', 'valid', 'subscribed', '2026-03-23T12:30:00Z', '2026-03-20T11:30:00Z', '2026-01-25T10:00:00Z', '2026-03-23T12:30:00Z'),
  ('20000000-0000-0000-0000-000000000003', 'lisa.chen@jnj.com', 'Lisa', 'Chen', '10000000-0000-0000-0000-000000000003', 'Johnson & Johnson', 'Regional Marketing Lead', '+1 973 555 0003', 'https://linkedin.com/in/lisa-chen', 'United States', 'New Brunswick', 'Healthcare', '5000+', 'CSV Import', '{"newsletter","jnj-batch"}', 'subscriber', 'Sales Team', 'not_requested', 'Active newsletter subscriber.', 'valid', 'subscribed', '2026-03-24T08:00:00Z', null, '2026-02-18T08:00:00Z', '2026-03-24T08:00:00Z'),
  ('20000000-0000-0000-0000-000000000004', 'sophie.meyer@novartis.com', 'Sophie', 'Meyer', '10000000-0000-0000-0000-000000000002', 'Novartis AG', 'Procurement Manager', '+41 79 555 0004', 'https://linkedin.com/in/sophie-meyer', 'Switzerland', 'Basel', 'Pharmaceuticals', '5000+', 'Manual', '{"finance"}', 'delegate', 'Operations', 'not_requested', 'Finance contact for invoicing.', 'valid', 'unsubscribed', '2026-03-12T15:00:00Z', null, '2026-02-11T14:00:00Z', '2026-03-12T15:00:00Z'),
  ('20000000-0000-0000-0000-000000000005', 'andrea.bianchi@astrazeneca.com', 'Andrea', 'Bianchi', '10000000-0000-0000-0000-000000000001', 'AstraZeneca', 'Medical Affairs Manager', '+44 7700 900005', 'https://linkedin.com/in/andrea-bianchi', 'United Kingdom', 'Cambridge', 'Pharmaceuticals', '1001-5000', 'CSV Import', '{"bounced","legacy-list"}', 'lead', 'Sales Team', 'not_requested', 'Legacy contact from old database.', 'catch-all', 'bounced', '2026-03-05T07:30:00Z', null, '2026-01-20T09:00:00Z', '2026-03-05T07:30:00Z')
on conflict (id) do nothing;

insert into public.crm_segments (
  id, name, description, rule_groups, group_logic, is_active, segment_kind, created_at, updated_at, last_calculated_at
)
values
  ('30000000-0000-0000-0000-000000000001', 'All Pharma Contacts', 'Core pharma audience for 2026 outreach.', '[]'::jsonb, 'AND', true, 'manual', '2026-02-10T09:00:00Z', '2026-03-20T09:00:00Z', '2026-03-20T09:00:00Z'),
  ('30000000-0000-0000-0000-000000000002', 'Brochure Requests', 'Contacts who requested brochure material.', '[{"id":"group-1","logic":"AND","rules":[{"id":"rule-1","field":"brochureStatus","fieldType":"select","operator":"equals","value":"requested"}]}]'::jsonb, 'AND', true, 'dynamic', '2026-02-18T11:00:00Z', '2026-03-21T11:00:00Z', '2026-03-21T11:00:00Z'),
  ('30000000-0000-0000-0000-000000000003', 'Newsletter Active', 'Subscribed contacts for newsletter sends.', '[{"id":"group-1","logic":"AND","rules":[{"id":"rule-1","field":"subscriptionStatus","fieldType":"select","operator":"equals","value":"subscribed"}]}]'::jsonb, 'AND', true, 'dynamic', '2026-02-22T08:00:00Z', '2026-03-22T08:00:00Z', '2026-03-22T08:00:00Z')
on conflict (id) do nothing;

insert into public.crm_segment_contacts (segment_id, contact_id, added_at)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-02-10T09:05:00Z'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-02-10T09:05:00Z'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', '2026-02-10T09:05:00Z'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '2026-03-01T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '2026-03-02T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '2026-03-02T10:00:00Z'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '2026-03-02T10:00:00Z')
on conflict do nothing;

insert into public.crm_templates (
  id, name, format, subject, preview_text, text_content, created_at, updated_at
)
values
  ('35000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Invite', 'plain_text', 'Join us at EtapaHub Pharma Summit 2026', 'Short plain-text invitation optimized for delivery.', E'Hello {{first_name}},\n\nWe would like to invite you to EtapaHub Pharma Summit 2026.\n\nRegister here: {{cta_url}}\n\nBest regards,\nEtapaHub', '2026-02-15T09:00:00Z', '2026-02-15T09:00:00Z'),
  ('35000000-0000-0000-0000-000000000002', 'Brochure Follow-up', 'plain_text', 'Your requested brochure for EtapaHub', 'Follow-up used after brochure requests.', E'Hello {{first_name}},\n\nAs requested, here is the brochure.\n\nDownload: {{brochure_url}}\n\nRegards,\nEtapaHub Team', '2026-03-01T09:00:00Z', '2026-03-01T09:00:00Z')
on conflict (id) do nothing;

insert into public.crm_email_domains (
  id, name, provider, status, region, tracking, notes, created_at, updated_at
)
values
  ('36000000-0000-0000-0000-000000000001', 'mail.etapa-conferences.com', 'resend', 'verified', 'Ireland (eu-west-1)', 'enabled', 'Primary Resend production domain for event invitations.', '2026-03-02T08:00:00Z', '2026-03-22T08:00:00Z'),
  ('36000000-0000-0000-0000-000000000002', 'mg.etapahub.com', 'mailgun', 'verified', 'EU Central', 'enabled', 'Mailgun domain used for brochure and reminder flows.', '2026-02-12T10:30:00Z', '2026-03-18T08:00:00Z'),
  ('36000000-0000-0000-0000-000000000003', 'relay.etapahub.net', 'kumomta', 'warming', 'Romania VPS', 'partial', 'KumoMTA relay used for supervised overflow.', '2026-03-15T07:15:00Z', '2026-03-22T08:00:00Z')
on conflict (id) do nothing;

insert into public.crm_sender_identities (
  id, provider, from_name, email, reply_to, domain_id, region, status, volume_band, purpose, created_at, updated_at
)
values
  ('37000000-0000-0000-0000-000000000001', 'resend', 'EtapaHub Events', 'events@mail.etapa-conferences.com', 'events@mail.etapa-conferences.com', '36000000-0000-0000-0000-000000000001', 'Ireland (eu-west-1)', 'active', '6k-10k/day', 'Primary summit and conference invitation identity.', '2026-03-02T08:00:00Z', '2026-03-22T08:00:00Z'),
  ('37000000-0000-0000-0000-000000000002', 'mailgun', 'Brochure Desk', 'brochure@mg.etapahub.com', 'brochure@mg.etapahub.com', '36000000-0000-0000-0000-000000000002', 'EU Central', 'active', '8k-14k/day', 'Brochure and follow-up identity for engaged contacts.', '2026-02-12T10:30:00Z', '2026-03-18T08:00:00Z'),
  ('37000000-0000-0000-0000-000000000003', 'kumomta', 'Operations Routing', 'ops@relay.etapahub.net', 'ops@relay.etapahub.net', '36000000-0000-0000-0000-000000000003', 'Romania VPS', 'warmup', '40k-90k/day', 'Manual overflow routing on the VPS lane.', '2026-03-15T07:15:00Z', '2026-03-22T08:00:00Z')
on conflict (id) do nothing;

insert into public.crm_webhook_endpoints (
  id, provider, label, url, status, events, notes, last_event_at, created_at, updated_at
)
values
  ('38000000-0000-0000-0000-000000000001', 'resend', 'Provider Events', 'https://crm.etapahub.com/api/webhooks/provider-events', 'healthy', '{"delivered","bounced","complained","unsubscribed","clicked"}', 'Shared endpoint for Resend and Mailgun events.', '2026-03-24T10:28:00Z', '2026-03-10T08:00:00Z', '2026-03-24T10:28:00Z'),
  ('38000000-0000-0000-0000-000000000002', 'kumomta', 'Kumo Relay Sync', 'https://crm.etapahub.com/api/webhooks/kumo-sync', 'warming', '{"delivered","bounced"}', 'Relay sync for the KumoMTA VPS lane.', '2026-03-24T09:42:00Z', '2026-03-18T08:00:00Z', '2026-03-24T09:42:00Z')
on conflict (id) do nothing;

insert into public.crm_campaigns (
  id, name, template_id, sender_identity_id, provider, subject, preview_text, from_name, from_email, reply_to, status, notes, scheduled_at, sent_at, completed_at, created_at, updated_at
)
values
  ('40000000-0000-0000-0000-000000000001', 'Pharma Summit Invite Wave 1', '35000000-0000-0000-0000-000000000001', '37000000-0000-0000-0000-000000000001', 'resend', 'Join us at EtapaHub Pharma Summit 2026', 'First invitation wave to pharma decision makers.', 'EtapaHub Events', 'events@mail.etapa-conferences.com', 'events@mail.etapa-conferences.com', 'sent', 'First wave sent to pharma leadership list.', '2026-03-10T08:00:00Z', '2026-03-10T08:00:00Z', '2026-03-10T08:25:00Z', '2026-03-08T08:00:00Z', '2026-03-10T08:25:00Z'),
  ('40000000-0000-0000-0000-000000000002', 'Brochure Follow-up Batch A', '35000000-0000-0000-0000-000000000002', '37000000-0000-0000-0000-000000000002', 'mailgun', 'Your requested brochure for EtapaHub', 'Manual brochure follow-up batch.', 'Brochure Desk', 'brochure@mg.etapahub.com', 'brochure@mg.etapahub.com', 'scheduled', 'Brochure follow-up to requested leads.', '2026-03-28T09:30:00Z', null, null, '2026-03-22T12:00:00Z', '2026-03-22T12:00:00Z')
on conflict (id) do nothing;

insert into public.crm_campaign_segments (campaign_id, segment_id)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.crm_campaign_recipients (
  id, campaign_id, contact_id, email, delivery_status, sent_at, opened_at, clicked_at, replied_at, bounced_at, unsubscribed_at, complained_at, last_event_at, click_count, created_at
)
values
  ('45000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'elena.rossi@astrazeneca.com', 'clicked', '2026-03-10T08:00:00Z', '2026-03-10T08:06:00Z', '2026-03-10T08:08:00Z', '2026-03-18T09:00:00Z', null, null, null, '2026-03-18T09:00:00Z', 2, '2026-03-10T08:00:00Z'),
  ('45000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'marco.sala@novartis.com', 'opened', '2026-03-10T08:00:00Z', '2026-03-10T08:14:00Z', null, null, null, null, null, '2026-03-10T08:14:00Z', 0, '2026-03-10T08:00:00Z'),
  ('45000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'andrea.bianchi@astrazeneca.com', 'bounced', '2026-03-10T08:00:00Z', null, null, null, '2026-03-10T08:02:00Z', null, null, '2026-03-10T08:02:00Z', 0, '2026-03-10T08:00:00Z'),
  ('45000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'elena.rossi@astrazeneca.com', 'queued', null, null, null, null, null, null, null, null, 0, '2026-03-22T12:00:00Z')
on conflict (id) do nothing;

insert into public.crm_events (
  id, name, type, date, location, description, capacity, status, created_at, updated_at
)
values
  ('50000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Summit 2026', 'conference', '2026-05-15', 'Milan, Italy', 'Flagship B2B event for pharma and healthcare leaders.', 450, 'upcoming', '2026-02-01T09:00:00Z', '2026-03-20T09:00:00Z'),
  ('50000000-0000-0000-0000-000000000002', 'Medical Affairs Roundtable', 'workshop', '2026-04-04', 'Virtual', 'Closed workshop for medical affairs teams.', 80, 'upcoming', '2026-02-12T11:00:00Z', '2026-03-18T11:00:00Z'),
  ('50000000-0000-0000-0000-000000000003', 'Healthcare Innovation Breakfast', 'meetup', '2026-03-05', 'Basel, Switzerland', 'In-person breakfast and networking format.', 40, 'completed', '2026-01-20T08:00:00Z', '2026-03-06T08:00:00Z')
on conflict (id) do nothing;

insert into public.crm_event_participants (
  id, event_id, contact_id, status, registered_at, confirmed_at, attended_at, notes
)
values
  ('90000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'confirmed', '2026-03-18T09:00:00Z', '2026-03-19T09:30:00Z', null, 'Requested agenda and brochure.'),
  ('90000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'registered', '2026-03-20T11:00:00Z', null, null, 'Potential speaker.'),
  ('90000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'registered', '2026-03-23T10:00:00Z', null, null, null),
  ('90000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'attended', '2026-02-12T10:00:00Z', '2026-02-13T10:00:00Z', '2026-03-05T08:30:00Z', 'Joined networking breakfast.')
on conflict (id) do nothing;

insert into public.crm_registrations (
  id, event_id, event_name, contact_id, contact_name, contact_email, company_id, company_name, ticket_type, ticket_price, currency, quantity, total_amount, status, registered_at, confirmed_at, cancelled_at, invoice_id, additional_attendees, admin_notes, special_requirements, created_at, updated_at
)
values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Summit 2026', '20000000-0000-0000-0000-000000000001', 'Elena Rossi', 'elena.rossi@astrazeneca.com', '10000000-0000-0000-0000-000000000001', 'AstraZeneca', 'vip', 1290.00, 'EUR', 1, 1290.00, 'confirmed', '2026-03-18T09:00:00Z', '2026-03-19T09:30:00Z', null, '70000000-0000-0000-0000-000000000001', '[]'::jsonb, 'VIP registration confirmed.', null, '2026-03-18T09:00:00Z', '2026-03-19T09:30:00Z'),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Summit 2026', '20000000-0000-0000-0000-000000000002', 'Marco Sala', 'marco.sala@novartis.com', '10000000-0000-0000-0000-000000000002', 'Novartis AG', 'standard', 890.00, 'CHF', 2, 1780.00, 'pending', '2026-03-20T11:00:00Z', null, null, '70000000-0000-0000-0000-000000000002', '[{"name":"Sophie Meyer","email":"sophie.meyer@novartis.com","jobTitle":"Procurement Manager"}]'::jsonb, 'Waiting for finance confirmation.', 'Two seats requested, one delegate pending.', '2026-03-20T11:00:00Z', '2026-03-20T11:00:00Z'),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 'Medical Affairs Roundtable', '20000000-0000-0000-0000-000000000003', 'Lisa Chen', 'lisa.chen@jnj.com', '10000000-0000-0000-0000-000000000003', 'Johnson & Johnson', 'standard', 650.00, 'USD', 1, 650.00, 'confirmed', '2026-03-23T10:00:00Z', '2026-03-23T15:00:00Z', null, '70000000-0000-0000-0000-000000000003', '[]'::jsonb, 'Newsletter conversion.', null, '2026-03-23T10:00:00Z', '2026-03-23T15:00:00Z')
on conflict (id) do nothing;

insert into public.crm_invoices (
  id, invoice_number, invoice_date, due_date, status, registration_id, event_id, event_name, contact_id, contact_name, contact_email, company_id, company_name, subtotal, tax_rate, tax_amount, total_amount, currency, amount_paid, balance_due, payment_status, admin_notes, public_notes, created_at, updated_at
)
values
  ('70000000-0000-0000-0000-000000000001', 'EH-2026-001', '2026-03-19', '2026-03-29', 'paid', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Summit 2026', '20000000-0000-0000-0000-000000000001', 'Elena Rossi', 'elena.rossi@astrazeneca.com', '10000000-0000-0000-0000-000000000001', 'AstraZeneca', 1290.00, 0.00, 0.00, 1290.00, 'EUR', 1290.00, 0.00, 'paid', 'Paid by bank transfer.', 'Thank you for registering.', '2026-03-19T10:00:00Z', '2026-03-21T10:00:00Z'),
  ('70000000-0000-0000-0000-000000000002', 'EH-2026-002', '2026-03-20', '2026-04-03', 'issued', '60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Summit 2026', '20000000-0000-0000-0000-000000000002', 'Marco Sala', 'marco.sala@novartis.com', '10000000-0000-0000-0000-000000000002', 'Novartis AG', 1780.00, 0.00, 0.00, 1780.00, 'CHF', 0.00, 1780.00, 'unpaid', 'Awaiting finance sign-off.', 'Payment details attached.', '2026-03-20T12:00:00Z', '2026-03-20T12:00:00Z'),
  ('70000000-0000-0000-0000-000000000003', 'EH-2026-003', '2026-03-23', '2026-04-06', 'partially_paid', '60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 'Medical Affairs Roundtable', '20000000-0000-0000-0000-000000000003', 'Lisa Chen', 'lisa.chen@jnj.com', '10000000-0000-0000-0000-000000000003', 'Johnson & Johnson', 650.00, 0.00, 0.00, 650.00, 'USD', 300.00, 350.00, 'partially_paid', 'Deposit received.', 'Balance due before event.', '2026-03-23T16:00:00Z', '2026-03-24T09:00:00Z')
on conflict (id) do nothing;

insert into public.crm_invoice_line_items (
  id, invoice_id, description, quantity, unit_price, total_price
)
values
  ('71000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'EtapaHub Pharma Summit 2026 - VIP Ticket', 1, 1290.00, 1290.00),
  ('71000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'EtapaHub Pharma Summit 2026 - Standard Ticket', 2, 890.00, 1780.00),
  ('71000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000003', 'Medical Affairs Roundtable - Standard Ticket', 1, 650.00, 650.00)
on conflict (id) do nothing;

insert into public.crm_payments (
  id, invoice_id, amount, currency, payment_date, payment_method, payment_reference, status, notes, created_at, created_by
)
values
  ('72000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 1290.00, 'EUR', '2026-03-21T10:00:00Z', 'bank_transfer', 'AZ-EH-001', 'completed', 'Full payment received.', '2026-03-21T10:00:00Z', 'Finance'),
  ('72000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000003', 300.00, 'USD', '2026-03-24T09:00:00Z', 'card', 'JNJ-DEP-300', 'completed', 'Deposit paid by card.', '2026-03-24T09:00:00Z', 'Finance')
on conflict (id) do nothing;

insert into public.crm_activities (
  id, contact_id, type, title, description, metadata, created_at, created_by
)
values
  ('80000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'contact_created', 'Contact Created', 'Imported from pharma batch A.', '{"source":"csv"}'::jsonb, '2026-02-10T09:00:00Z', 'CRM'),
  ('80000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'segment_added', 'Added to Segment', 'Added to Brochure Requests.', '{"segment":"Brochure Requests"}'::jsonb, '2026-03-01T10:00:00Z', 'CRM'),
  ('80000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'email_clicked', 'Link Clicked', 'Clicked registration link inside Pharma Summit invite.', '{"campaign":"Pharma Summit Invite Wave 1"}'::jsonb, '2026-03-10T08:08:00Z', 'Webhook'),
  ('80000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'email_replied', 'Email Reply Received', 'Replied asking for the detailed agenda and brochure.', '{"campaign":"Pharma Summit Invite Wave 1"}'::jsonb, '2026-03-18T09:00:00Z', 'Inbox'),
  ('80000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'event_registered', 'Event Registration', 'Registered for EtapaHub Pharma Summit 2026.', '{"event":"EtapaHub Pharma Summit 2026"}'::jsonb, '2026-03-20T11:00:00Z', 'CRM'),
  ('80000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 'campaign_added', 'Added to Campaign', 'Included in newsletter active segment for roundtable follow-up.', '{"campaign":"Brochure Follow-up Batch A"}'::jsonb, '2026-03-22T12:00:00Z', 'CRM'),
  ('80000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 'contact_updated', 'Manual Unsubscribe', 'Contact manually unsubscribed by operations.', '{"status":"unsubscribed"}'::jsonb, '2026-03-12T15:00:00Z', 'Operations'),
  ('80000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', 'email_bounced', 'Email Bounced', 'Hard bounce detected on legacy outreach.', '{"campaign":"Pharma Summit Invite Wave 1"}'::jsonb, '2026-03-10T08:02:00Z', 'Webhook')
on conflict (id) do nothing;

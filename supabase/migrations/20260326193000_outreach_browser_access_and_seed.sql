grant usage on schema public to anon, authenticated;

grant select on public.crm_outreach_mailboxes to anon, authenticated;
grant select on public.crm_outreach_templates to anon, authenticated;
grant select on public.crm_outreach_sequences to anon, authenticated;
grant select on public.crm_outreach_sequence_steps to anon, authenticated;
grant select on public.crm_outreach_sequence_contacts to anon, authenticated;
grant select on public.crm_outreach_threads to anon, authenticated;
grant select on public.crm_outreach_messages to anon, authenticated;
grant select on public.crm_outreach_tasks to anon, authenticated;

alter table public.crm_outreach_mailboxes enable row level security;
alter table public.crm_outreach_templates enable row level security;
alter table public.crm_outreach_sequences enable row level security;
alter table public.crm_outreach_sequence_steps enable row level security;
alter table public.crm_outreach_sequence_contacts enable row level security;
alter table public.crm_outreach_threads enable row level security;
alter table public.crm_outreach_messages enable row level security;
alter table public.crm_outreach_tasks enable row level security;

drop policy if exists crm_outreach_mailboxes_select on public.crm_outreach_mailboxes;
drop policy if exists crm_outreach_mailboxes_all on public.crm_outreach_mailboxes;
create policy crm_outreach_mailboxes_select on public.crm_outreach_mailboxes for select to anon, authenticated using (true);

drop policy if exists crm_outreach_templates_select on public.crm_outreach_templates;
drop policy if exists crm_outreach_templates_all on public.crm_outreach_templates;
create policy crm_outreach_templates_select on public.crm_outreach_templates for select to anon, authenticated using (true);

drop policy if exists crm_outreach_sequences_select on public.crm_outreach_sequences;
drop policy if exists crm_outreach_sequences_all on public.crm_outreach_sequences;
create policy crm_outreach_sequences_select on public.crm_outreach_sequences for select to anon, authenticated using (true);

drop policy if exists crm_outreach_sequence_steps_select on public.crm_outreach_sequence_steps;
drop policy if exists crm_outreach_sequence_steps_all on public.crm_outreach_sequence_steps;
create policy crm_outreach_sequence_steps_select on public.crm_outreach_sequence_steps for select to anon, authenticated using (true);

drop policy if exists crm_outreach_sequence_contacts_select on public.crm_outreach_sequence_contacts;
drop policy if exists crm_outreach_sequence_contacts_all on public.crm_outreach_sequence_contacts;
create policy crm_outreach_sequence_contacts_select on public.crm_outreach_sequence_contacts for select to anon, authenticated using (true);

drop policy if exists crm_outreach_threads_select on public.crm_outreach_threads;
drop policy if exists crm_outreach_threads_all on public.crm_outreach_threads;
create policy crm_outreach_threads_select on public.crm_outreach_threads for select to anon, authenticated using (true);

drop policy if exists crm_outreach_messages_select on public.crm_outreach_messages;
drop policy if exists crm_outreach_messages_all on public.crm_outreach_messages;
create policy crm_outreach_messages_select on public.crm_outreach_messages for select to anon, authenticated using (true);

drop policy if exists crm_outreach_tasks_select on public.crm_outreach_tasks;
drop policy if exists crm_outreach_tasks_all on public.crm_outreach_tasks;
create policy crm_outreach_tasks_select on public.crm_outreach_tasks for select to anon, authenticated using (true);

-- Reset only the deterministic demo records used by the Outreach workspace.
delete from public.crm_outreach_tasks
where title in (
  'Book intro call with Elena Rossi',
  'Send manual follow-up to Marco Sala',
  'LinkedIn touch for Lisa Chen',
  'Validate Andrea Bianchi email address'
);

delete from public.crm_outreach_messages
where thread_id in (
  select id
  from public.crm_outreach_threads
  where subject in (
    'Quick intro for Elena at AstraZeneca',
    'Following up on my note, Marco',
    'Still worth reopening this for Lisa?',
    'Bounce detected for Andrea Bianchi'
  )
);

delete from public.crm_outreach_threads
where subject in (
  'Quick intro for Elena at AstraZeneca',
  'Following up on my note, Marco',
  'Still worth reopening this for Lisa?',
  'Bounce detected for Andrea Bianchi'
);

delete from public.crm_outreach_sequence_contacts
where sequence_id in (
  select id
  from public.crm_outreach_sequences
  where (owner_name, name) in (
    ('Clara Rossi', 'Expo Warm Intro'),
    ('Daniel Meyer', 'Event Follow-up'),
    ('Lucia Bianchi', 'Re-engage Q2')
  )
);

delete from public.crm_outreach_sequence_steps
where sequence_id in (
  select id
  from public.crm_outreach_sequences
  where (owner_name, name) in (
    ('Clara Rossi', 'Expo Warm Intro'),
    ('Daniel Meyer', 'Event Follow-up'),
    ('Lucia Bianchi', 'Re-engage Q2')
  )
);

delete from public.crm_outreach_sequences
where (owner_name, name) in (
  ('Clara Rossi', 'Expo Warm Intro'),
  ('Daniel Meyer', 'Event Follow-up'),
  ('Lucia Bianchi', 'Re-engage Q2')
);

delete from public.crm_outreach_templates
where (owner_name, name) in (
  ('Clara Rossi', 'Intro Call Invite'),
  ('Daniel Meyer', 'Reply Nudge'),
  ('Lucia Bianchi', 'Meeting Confirm'),
  ('Clara Rossi', 'Re-engage After Silence')
);

delete from public.crm_outreach_mailboxes
where mailbox_email in (
  'clara.rossi@etapahub.com',
  'daniel.meyer@etapahub.com',
  'lucia.bianchi@etapahub.com'
);

insert into public.crm_outreach_mailboxes (
  owner_name,
  owner_email,
  provider,
  mailbox_email,
  display_name,
  connection_status,
  sending_health,
  daily_limit,
  last_sync_at,
  oauth_connected_at,
  metadata
)
values
  (
    'Clara Rossi',
    'clara.rossi@etapahub.com',
    'google_workspace',
    'clara.rossi@etapahub.com',
    'Clara Rossi',
    'connected',
    'healthy',
    40,
    now() - interval '18 minutes',
    now() - interval '2 days',
    jsonb_build_object('mailbox_kind', 'seller')
  ),
  (
    'Daniel Meyer',
    'daniel.meyer@etapahub.com',
    'microsoft_365',
    'daniel.meyer@etapahub.com',
    'Daniel Meyer',
    'connected',
    'warming',
    30,
    now() - interval '31 minutes',
    now() - interval '1 day',
    jsonb_build_object('mailbox_kind', 'seller')
  ),
  (
    'Lucia Bianchi',
    'lucia.bianchi@etapahub.com',
    'outlook',
    'lucia.bianchi@etapahub.com',
    'Lucia Bianchi',
    'attention',
    'at_risk',
    20,
    now() - interval '4 hours',
    now() - interval '6 days',
    jsonb_build_object('mailbox_kind', 'seller')
  );

insert into public.crm_outreach_templates (
  owner_name,
  name,
  category,
  subject,
  plain_text_body,
  html_body,
  metadata
)
values
  (
    'Clara Rossi',
    'Intro Call Invite',
    'intro',
    'Quick intro for {{first_name}} at {{company}}',
    E'Hi {{first_name}},\n\nI am reaching out personally from EtapaHub because I would like to open a direct conversation with {{company}}.\n\nWould you be open to a short intro call next week?\n\nBest regards,\nClara',
    null,
    jsonb_build_object('channel', 'seller_outreach')
  ),
  (
    'Daniel Meyer',
    'Reply Nudge',
    'follow_up',
    'Following up on my note, {{first_name}}',
    E'Hi {{first_name}},\n\nJust bringing this back to the top of your inbox in case the first note was buried.\n\nIf it helps, I can send a short summary tailored to {{company}}.\n\nBest regards,\nDaniel',
    null,
    jsonb_build_object('channel', 'seller_outreach')
  ),
  (
    'Lucia Bianchi',
    'Meeting Confirm',
    'meeting',
    'Locking a time for {{company}}',
    E'Hi {{first_name}},\n\nHappy to continue the conversation.\n\nI can hold a 20 minute slot for us and keep it focused on {{company}}.\n\nBest regards,\nLucia',
    null,
    jsonb_build_object('channel', 'seller_outreach')
  ),
  (
    'Clara Rossi',
    'Re-engage After Silence',
    're_engage',
    'Still worth reopening this for {{first_name}}?',
    E'Hi {{first_name}},\n\nClosing the loop on my previous note. If this is still relevant for {{company}}, I can send a concise overview or book a short intro.\n\nBest regards,\nClara',
    null,
    jsonb_build_object('channel', 'seller_outreach')
  );

insert into public.crm_outreach_sequences (
  owner_name,
  name,
  status,
  description,
  stop_on_reply,
  stop_on_interested,
  metadata
)
values
  (
    'Clara Rossi',
    'Expo Warm Intro',
    'active',
    'Warm follow-up for sellers reconnecting with contacts met around recent events.',
    true,
    true,
    jsonb_build_object('open_rate', 71, 'reply_rate', 22, 'active_contacts', 14, 'completed_contacts', 4)
  ),
  (
    'Daniel Meyer',
    'Event Follow-up',
    'active',
    'Post-event seller sequence focused on direct replies, not bulk campaign delivery.',
    true,
    true,
    jsonb_build_object('open_rate', 64, 'reply_rate', 17, 'active_contacts', 22, 'completed_contacts', 7)
  ),
  (
    'Lucia Bianchi',
    'Re-engage Q2',
    'draft',
    'Re-open stalled conversations with a softer seller-owned motion and a mandatory human step.',
    true,
    true,
    jsonb_build_object('open_rate', 0, 'reply_rate', 0, 'active_contacts', 8, 'completed_contacts', 0)
  );

with sequence_refs as (
  select id, owner_name, name
  from public.crm_outreach_sequences
  where (owner_name, name) in (
    ('Clara Rossi', 'Expo Warm Intro'),
    ('Daniel Meyer', 'Event Follow-up'),
    ('Lucia Bianchi', 'Re-engage Q2')
  )
), template_refs as (
  select id, owner_name, name
  from public.crm_outreach_templates
  where (owner_name, name) in (
    ('Clara Rossi', 'Intro Call Invite'),
    ('Daniel Meyer', 'Reply Nudge'),
    ('Lucia Bianchi', 'Meeting Confirm'),
    ('Clara Rossi', 'Re-engage After Silence')
  )
)
insert into public.crm_outreach_sequence_steps (
  sequence_id,
  step_order,
  step_type,
  title,
  delay_days,
  template_id,
  priority,
  metadata
)
select sequence_id, step_order, step_type, title, delay_days, template_id, priority, '{}'::jsonb
from (
  select
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro') as sequence_id,
    1 as step_order,
    'automatic_email'::text as step_type,
    'Initial personal intro'::text as title,
    0 as delay_days,
    (select id from template_refs where owner_name = 'Clara Rossi' and name = 'Intro Call Invite') as template_id,
    null::text as priority
  union all
  select
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro'),
    2,
    'manual_email',
    'Seller follow-up after 2 days',
    2,
    (select id from template_refs where owner_name = 'Daniel Meyer' and name = 'Reply Nudge'),
    'medium'
  union all
  select
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro'),
    3,
    'call',
    'Call task instead of another auto-send',
    4,
    null,
    'high'
  union all
  select
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    1,
    'automatic_email',
    'Recap and intro',
    0,
    (select id from template_refs where owner_name = 'Clara Rossi' and name = 'Intro Call Invite'),
    null
  union all
  select
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    2,
    'manual_email',
    'Manual response to engaged contacts',
    2,
    (select id from template_refs where owner_name = 'Daniel Meyer' and name = 'Reply Nudge'),
    'medium'
  union all
  select
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    3,
    'task',
    'Create seller task for qualification',
    4,
    null,
    'medium'
  union all
  select
    (select id from sequence_refs where owner_name = 'Lucia Bianchi' and name = 'Re-engage Q2'),
    1,
    'automatic_email',
    'Re-engage email',
    0,
    (select id from template_refs where owner_name = 'Clara Rossi' and name = 'Re-engage After Silence'),
    null
  union all
  select
    (select id from sequence_refs where owner_name = 'Lucia Bianchi' and name = 'Re-engage Q2'),
    2,
    'linkedin',
    'Human touch on LinkedIn',
    3,
    null,
    'medium'
  union all
  select
    (select id from sequence_refs where owner_name = 'Lucia Bianchi' and name = 'Re-engage Q2'),
    3,
    'call',
    'Final call attempt',
    5,
    null,
    'high'
) seeded_steps
where sequence_id is not null;

with sequence_refs as (
  select id, owner_name, name
  from public.crm_outreach_sequences
  where (owner_name, name) in (
    ('Clara Rossi', 'Expo Warm Intro'),
    ('Daniel Meyer', 'Event Follow-up'),
    ('Lucia Bianchi', 'Re-engage Q2')
  )
), mailbox_refs as (
  select id, mailbox_email
  from public.crm_outreach_mailboxes
  where mailbox_email in (
    'clara.rossi@etapahub.com',
    'daniel.meyer@etapahub.com',
    'lucia.bianchi@etapahub.com'
  )
), contact_refs as (
  select id, email
  from public.crm_contacts
  where email in (
    'elena.rossi@astrazeneca.com',
    'marco.sala@novartis.com',
    'lisa.chen@jnj.com',
    'andrea.bianchi@astrazeneca.com',
    'sophie.meyer@novartis.com'
  )
)
insert into public.crm_outreach_sequence_contacts (
  sequence_id,
  contact_id,
  mailbox_id,
  status,
  current_step_order,
  enrolled_at,
  paused_until,
  completed_at,
  metadata
)
select sequence_id, contact_id, mailbox_id, status, current_step_order, enrolled_at, paused_until, completed_at, '{}'::jsonb
from (
  select
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro') as sequence_id,
    (select id from contact_refs where email = 'elena.rossi@astrazeneca.com') as contact_id,
    (select id from mailbox_refs where mailbox_email = 'clara.rossi@etapahub.com') as mailbox_id,
    'active'::text as status,
    2 as current_step_order,
    now() - interval '2 days' as enrolled_at,
    null::timestamptz as paused_until,
    null::timestamptz as completed_at
  union all
  select
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro'),
    (select id from contact_refs where email = 'andrea.bianchi@astrazeneca.com'),
    (select id from mailbox_refs where mailbox_email = 'clara.rossi@etapahub.com'),
    'completed',
    3,
    now() - interval '7 days',
    null,
    now() - interval '3 days'
  union all
  select
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    (select id from contact_refs where email = 'marco.sala@novartis.com'),
    (select id from mailbox_refs where mailbox_email = 'daniel.meyer@etapahub.com'),
    'active',
    2,
    now() - interval '3 days',
    null,
    null
  union all
  select
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    (select id from contact_refs where email = 'sophie.meyer@novartis.com'),
    (select id from mailbox_refs where mailbox_email = 'daniel.meyer@etapahub.com'),
    'completed',
    3,
    now() - interval '10 days',
    null,
    now() - interval '4 days'
  union all
  select
    (select id from sequence_refs where owner_name = 'Lucia Bianchi' and name = 'Re-engage Q2'),
    (select id from contact_refs where email = 'lisa.chen@jnj.com'),
    (select id from mailbox_refs where mailbox_email = 'lucia.bianchi@etapahub.com'),
    'active',
    1,
    now() - interval '1 day',
    null,
    null
) seeded_contacts
where sequence_id is not null and contact_id is not null and mailbox_id is not null;

with mailbox_refs as (
  select id, mailbox_email
  from public.crm_outreach_mailboxes
  where mailbox_email in (
    'clara.rossi@etapahub.com',
    'daniel.meyer@etapahub.com',
    'lucia.bianchi@etapahub.com'
  )
), contact_refs as (
  select id, email
  from public.crm_contacts
  where email in (
    'elena.rossi@astrazeneca.com',
    'marco.sala@novartis.com',
    'lisa.chen@jnj.com',
    'andrea.bianchi@astrazeneca.com'
  )
), sequence_refs as (
  select id, owner_name, name
  from public.crm_outreach_sequences
  where (owner_name, name) in (
    ('Clara Rossi', 'Expo Warm Intro'),
    ('Daniel Meyer', 'Event Follow-up'),
    ('Lucia Bianchi', 'Re-engage Q2')
  )
)
insert into public.crm_outreach_threads (
  contact_id,
  mailbox_id,
  sequence_id,
  owner_name,
  status,
  last_event,
  unread_count,
  subject,
  preview,
  last_activity_at,
  metadata
)
select contact_id, mailbox_id, sequence_id, owner_name, status, last_event, unread_count, subject, preview, last_activity_at, '{}'::jsonb
from (
  select
    (select id from contact_refs where email = 'elena.rossi@astrazeneca.com') as contact_id,
    (select id from mailbox_refs where mailbox_email = 'clara.rossi@etapahub.com') as mailbox_id,
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro') as sequence_id,
    'Clara Rossi'::text as owner_name,
    'active'::text as status,
    'replied'::text as last_event,
    1 as unread_count,
    'Quick intro for Elena at AstraZeneca'::text as subject,
    'Sounds relevant. Can you share two time slots for next week?'::text as preview,
    now() - interval '22 minutes' as last_activity_at
  union all
  select
    (select id from contact_refs where email = 'marco.sala@novartis.com'),
    (select id from mailbox_refs where mailbox_email = 'daniel.meyer@etapahub.com'),
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    'Daniel Meyer',
    'waiting',
    'clicked',
    0,
    'Following up on my note, Marco',
    'Tracked click on the case-study link. Waiting for the +2 day manual email step.',
    now() - interval '2 hours'
  union all
  select
    (select id from contact_refs where email = 'lisa.chen@jnj.com'),
    (select id from mailbox_refs where mailbox_email = 'lucia.bianchi@etapahub.com'),
    (select id from sequence_refs where owner_name = 'Lucia Bianchi' and name = 'Re-engage Q2'),
    'Lucia Bianchi',
    'needs_reply',
    'opened',
    0,
    'Still worth reopening this for Lisa?',
    'Opened twice. Waiting on a manual seller follow-up before the thread cools down.',
    now() - interval '5 hours'
  union all
  select
    (select id from contact_refs where email = 'andrea.bianchi@astrazeneca.com'),
    (select id from mailbox_refs where mailbox_email = 'clara.rossi@etapahub.com'),
    null,
    'Clara Rossi',
    'bounced',
    'bounced',
    0,
    'Bounce detected for Andrea Bianchi',
    'Mailbox issue detected. Contact removed from automatic sends until manually reviewed.',
    now() - interval '1 day'
) seeded_threads
where contact_id is not null and mailbox_id is not null;

with thread_refs as (
  select id, subject
  from public.crm_outreach_threads
  where subject in (
    'Quick intro for Elena at AstraZeneca',
    'Following up on my note, Marco',
    'Still worth reopening this for Lisa?',
    'Bounce detected for Andrea Bianchi'
  )
), mailbox_refs as (
  select id, mailbox_email
  from public.crm_outreach_mailboxes
  where mailbox_email in (
    'clara.rossi@etapahub.com',
    'daniel.meyer@etapahub.com',
    'lucia.bianchi@etapahub.com'
  )
)
insert into public.crm_outreach_messages (
  thread_id,
  direction,
  subject,
  body,
  event,
  mailbox_id,
  sent_at
)
select thread_id, direction, subject, body, event, mailbox_id, sent_at
from (
  select
    (select id from thread_refs where subject = 'Quick intro for Elena at AstraZeneca') as thread_id,
    'outbound'::text as direction,
    'Quick intro for Elena at AstraZeneca'::text as subject,
    E'Hi Elena,\n\nI am reaching out personally from EtapaHub because I would like to open a direct conversation with AstraZeneca.\n\nWould you be open to a short intro call next week?\n\nBest regards,\nClara'::text as body,
    'opened'::text as event,
    (select id from mailbox_refs where mailbox_email = 'clara.rossi@etapahub.com') as mailbox_id,
    now() - interval '1 day' as sent_at
  union all
  select
    (select id from thread_refs where subject = 'Quick intro for Elena at AstraZeneca'),
    'inbound',
    'Re: Quick intro for Elena at AstraZeneca',
    'Sounds relevant. Can you share two time slots for next week?',
    'replied',
    null,
    now() - interval '22 minutes'
  union all
  select
    (select id from thread_refs where subject = 'Following up on my note, Marco'),
    'outbound',
    'Following up on my note, Marco',
    E'Hi Marco,\n\nJust bringing this back to the top of your inbox in case the first note was buried.\n\nIf it helps, I can send a short summary tailored to Novartis AG.\n\nBest regards,\nDaniel',
    'clicked',
    (select id from mailbox_refs where mailbox_email = 'daniel.meyer@etapahub.com'),
    now() - interval '2 days'
  union all
  select
    (select id from thread_refs where subject = 'Still worth reopening this for Lisa?'),
    'outbound',
    'Still worth reopening this for Lisa?',
    E'Hi Lisa,\n\nClosing the loop on my previous note. If this is still relevant for Johnson & Johnson, I can send a concise overview or book a short intro.\n\nBest regards,\nLucia',
    'opened',
    (select id from mailbox_refs where mailbox_email = 'lucia.bianchi@etapahub.com'),
    now() - interval '18 hours'
  union all
  select
    (select id from thread_refs where subject = 'Bounce detected for Andrea Bianchi'),
    'system',
    'Bounce detected',
    'Message bounced. Seller follow-up is blocked until the mailbox or contact email is reviewed.',
    'bounced',
    null,
    now() - interval '1 day'
) seeded_messages
where thread_id is not null;

with thread_refs as (
  select id, subject
  from public.crm_outreach_threads
  where subject in (
    'Quick intro for Elena at AstraZeneca',
    'Following up on my note, Marco',
    'Still worth reopening this for Lisa?'
  )
), sequence_refs as (
  select id, owner_name, name
  from public.crm_outreach_sequences
  where (owner_name, name) in (
    ('Clara Rossi', 'Expo Warm Intro'),
    ('Daniel Meyer', 'Event Follow-up'),
    ('Lucia Bianchi', 'Re-engage Q2')
  )
), contact_refs as (
  select id, email
  from public.crm_contacts
  where email in (
    'elena.rossi@astrazeneca.com',
    'marco.sala@novartis.com',
    'lisa.chen@jnj.com',
    'andrea.bianchi@astrazeneca.com'
  )
)
insert into public.crm_outreach_tasks (
  contact_id,
  thread_id,
  sequence_id,
  owner_name,
  title,
  task_type,
  priority,
  status,
  due_at,
  note,
  metadata
)
select contact_id, thread_id, sequence_id, owner_name, title, task_type, priority, status, due_at, note, '{}'::jsonb
from (
  select
    (select id from contact_refs where email = 'elena.rossi@astrazeneca.com') as contact_id,
    (select id from thread_refs where subject = 'Quick intro for Elena at AstraZeneca') as thread_id,
    (select id from sequence_refs where owner_name = 'Clara Rossi' and name = 'Expo Warm Intro') as sequence_id,
    'Clara Rossi'::text as owner_name,
    'Book intro call with Elena Rossi'::text as title,
    'call'::text as task_type,
    'high'::text as priority,
    'open'::text as status,
    now() + interval '1 day' as due_at,
    'Reply received. Seller should confirm next week availability.'::text as note
  union all
  select
    (select id from contact_refs where email = 'marco.sala@novartis.com'),
    (select id from thread_refs where subject = 'Following up on my note, Marco'),
    (select id from sequence_refs where owner_name = 'Daniel Meyer' and name = 'Event Follow-up'),
    'Daniel Meyer',
    'Send manual follow-up to Marco Sala',
    'manual_email',
    'medium',
    'open',
    now() + interval '2 days',
    'Contact clicked the link but has not replied yet.'
  union all
  select
    (select id from contact_refs where email = 'lisa.chen@jnj.com'),
    (select id from thread_refs where subject = 'Still worth reopening this for Lisa?'),
    (select id from sequence_refs where owner_name = 'Lucia Bianchi' and name = 'Re-engage Q2'),
    'Lucia Bianchi',
    'LinkedIn touch for Lisa Chen',
    'linkedin',
    'medium',
    'open',
    now() + interval '1 day' + interval '6 hours',
    'Sequence requires a human touch before the final re-engage step.'
  union all
  select
    (select id from contact_refs where email = 'andrea.bianchi@astrazeneca.com'),
    null,
    null,
    'Clara Rossi',
    'Validate Andrea Bianchi email address',
    'action_item',
    'high',
    'open',
    now() + interval '8 hours',
    'Bounce review required before re-entering any seller workflow.'
) seeded_tasks
where contact_id is not null;

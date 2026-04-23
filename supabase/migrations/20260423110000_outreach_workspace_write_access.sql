grant insert, update on public.crm_outreach_mailboxes to anon, authenticated;
grant insert, update on public.crm_outreach_templates to anon, authenticated;
grant insert, update on public.crm_outreach_sequences to anon, authenticated;
grant insert, update on public.crm_outreach_sequence_steps to anon, authenticated;
grant insert, update on public.crm_outreach_tasks to anon, authenticated;

drop policy if exists crm_outreach_mailboxes_insert on public.crm_outreach_mailboxes;
create policy crm_outreach_mailboxes_insert on public.crm_outreach_mailboxes for insert to anon, authenticated with check (true);
drop policy if exists crm_outreach_mailboxes_update on public.crm_outreach_mailboxes;
create policy crm_outreach_mailboxes_update on public.crm_outreach_mailboxes for update to anon, authenticated using (true) with check (true);

drop policy if exists crm_outreach_templates_insert on public.crm_outreach_templates;
create policy crm_outreach_templates_insert on public.crm_outreach_templates for insert to anon, authenticated with check (true);
drop policy if exists crm_outreach_templates_update on public.crm_outreach_templates;
create policy crm_outreach_templates_update on public.crm_outreach_templates for update to anon, authenticated using (true) with check (true);

drop policy if exists crm_outreach_sequences_insert on public.crm_outreach_sequences;
create policy crm_outreach_sequences_insert on public.crm_outreach_sequences for insert to anon, authenticated with check (true);
drop policy if exists crm_outreach_sequences_update on public.crm_outreach_sequences;
create policy crm_outreach_sequences_update on public.crm_outreach_sequences for update to anon, authenticated using (true) with check (true);

drop policy if exists crm_outreach_sequence_steps_insert on public.crm_outreach_sequence_steps;
create policy crm_outreach_sequence_steps_insert on public.crm_outreach_sequence_steps for insert to anon, authenticated with check (true);
drop policy if exists crm_outreach_sequence_steps_update on public.crm_outreach_sequence_steps;
create policy crm_outreach_sequence_steps_update on public.crm_outreach_sequence_steps for update to anon, authenticated using (true) with check (true);

drop policy if exists crm_outreach_tasks_insert on public.crm_outreach_tasks;
create policy crm_outreach_tasks_insert on public.crm_outreach_tasks for insert to anon, authenticated with check (true);
drop policy if exists crm_outreach_tasks_update on public.crm_outreach_tasks;
create policy crm_outreach_tasks_update on public.crm_outreach_tasks for update to anon, authenticated using (true) with check (true);

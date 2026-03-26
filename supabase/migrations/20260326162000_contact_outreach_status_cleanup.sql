update public.crm_contacts
set tags = coalesce(
  array(
    select tag
    from unnest(coalesce(tags, array[]::text[])) as tag
    where tag not like '__outreach_status:%'
  ),
  array[]::text[]
)
where exists (
  select 1
  from unnest(coalesce(tags, array[]::text[])) as tag
  where tag like '__outreach_status:%'
);

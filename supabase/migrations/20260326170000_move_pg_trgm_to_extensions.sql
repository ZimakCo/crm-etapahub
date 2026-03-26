create schema if not exists extensions;

do $$
begin
  if exists (
    select 1
    from pg_extension
    where extname = 'pg_trgm'
      and extnamespace::regnamespace::text <> 'extensions'
  ) then
    execute 'alter extension pg_trgm set schema extensions';
  end if;
end;
$$;

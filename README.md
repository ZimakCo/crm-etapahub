# EtapaHub CRM Phase 1

First working phase for the EtapaHub CRM frontend:

- Supabase-ready data layer with fallback to in-memory dummy data
- Real CRUD entry points for contacts, CSV imports, events, segments, and campaigns
- SQL migration and seed files under [`supabase/migrations/20260324000000_crm_phase1.sql`](/Users/alekszimak/Documenti/Zimak.Co/Projects/ETAPA/CRM-Etapahub/crm-system-etapahub/supabase/migrations/20260324000000_crm_phase1.sql) and [`supabase/seed.sql`](/Users/alekszimak/Documenti/Zimak.Co/Projects/ETAPA/CRM-Etapahub/crm-system-etapahub/supabase/seed.sql)

## Local run

```bash
npm install
npm run dev
```

The app reads:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

If the Supabase schema is not available yet, the UI falls back to the existing dummy dataset so the product remains usable while the database is being provisioned.

## Apply database schema

Once the real Postgres password is available for:

```bash
postgresql://postgres:[YOUR-PASSWORD]@db.lhjylobztqlrvmpjbctz.supabase.co:5432/postgres
```

run:

```bash
export SUPABASE_DB_URL='postgresql://postgres:YOUR_PASSWORD@db.lhjylobztqlrvmpjbctz.supabase.co:5432/postgres'
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260324000000_crm_phase1.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## Notes

- Tables are namespaced as `crm_*` so they can coexist with other Supabase modules.
- Current RLS policies are intentionally open for prototype usage with the publishable key.
- Before production, add authentication and tighten RLS instead of exposing write access to `anon`.

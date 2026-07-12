# FleetPulse

Real-time AI fleet-optimization MVP for Indian logistics operators.

## Run locally

1. Create a Supabase project in the closest region to the pilot fleet and save its database password securely.
2. In Supabase SQL Editor, create a dedicated Prisma role using the SQL below. Replace the placeholder with a generated password.
3. Open **Connect** in Supabase. Put the Session pooler URL (port `5432`) in `DATABASE_URL` and the Direct connection URL in `DIRECT_URL`. If the development machine cannot reach the IPv6 direct endpoint, use the Session pooler URL for `DIRECT_URL` too.
4. Populate the remaining values in `.env`, install dependencies with `npm install`, then run `npm run db:generate`, `npm run db:push`, and `npm run db:seed` once for the new project.
5. Start the ML service with `docker compose up ml -d`, start the app with `npm run dev`, and open `http://localhost:3000`.

```sql
create user "prisma" with password 'REPLACE_WITH_A_GENERATED_PASSWORD' bypassrls createdb;
grant "prisma" to "postgres";
grant usage, create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

For deployments, use `npm run db:deploy` rather than `db:push`. Keep both database URLs server-only; neither belongs in browser code.

Send demo telemetry with API key `demo-device-key` to `POST /api/v1/telemetry`. The dashboard uses Socket.IO and joins the demo organization room. Production device keys must be rotated and stored securely.

Google Maps/Routes and Meta WhatsApp are configuration-ready. A missing external credential keeps the MVP safely in demo/preview mode.

## Pilot launch gate

Before exposing the service, enable Supabase backups and point-in-time recovery appropriate to the pilot tier, terminate TLS at the deployment edge, supply all production secrets, rotate every device API key, and configure an error-monitoring provider. The telemetry route is rate-limited and validates India-bound coordinates; use a gateway/WAF for distributed rate limiting. Do not treat the seeded `demo-device-key` as a production credential.

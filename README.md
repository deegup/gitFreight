# FleetPulse

Real-time AI fleet-optimization MVP for Indian logistics operators.

## Run locally

1. Copy `.env.example` to `.env` and populate Google/Meta credentials when available.
2. Start PostgreSQL and ML service: `docker compose up db ml -d`.
3. Install dependencies: `npm install`, then run `npm run db:generate`, `npm run db:push`, and `npm run db:seed`.
4. Start the app with `npm run dev` and open `http://localhost:3000`.

Send demo telemetry with API key `demo-device-key` to `POST /api/v1/telemetry`. The dashboard uses Socket.IO and joins the demo organization room. Production device keys must be rotated and stored securely.

Google Maps/Routes and Meta WhatsApp are configuration-ready. A missing external credential keeps the MVP safely in demo/preview mode.

## Pilot launch gate

Before exposing the service, use managed PostgreSQL with daily backups, terminate TLS at the deployment edge, supply all production secrets, restrict database access to the application network, rotate every device API key, and configure an error-monitoring provider. The telemetry route is rate-limited and validates India-bound coordinates; use a gateway/WAF for distributed rate limiting. Do not treat the seeded `demo-device-key` as a production credential.

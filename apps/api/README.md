# Lingr API (Run 5 foundation)

Minimal production-oriented backend foundation for Lingr.

## Included in this run

- HTTP server shell (`node:http`)
- route module structure (`src/routes`)
- health/status endpoint (`GET /health`, `GET /status`)
- shared API envelope helper (`src/http/envelope.js`)
- centralized API error helper + middleware (`src/http/errors.js`)
- request-context middleware for request IDs (`src/middleware/request-context.js`)
- JSON content-type validation boundary for non-GET methods (`src/middleware/validate-json.js`)
- Prisma ORM foundation (`prisma/schema.prisma`) and initial migration placeholder
- DB health check included in `GET /health` and `GET /status`

## Deferred (intentional)

- auth/session implementation
- full domain persistence implementation (only foundation users/profiles/sessions schema exists)
- domain business endpoints
- realtime messaging
- moderation workflows

## Run locally

```bash
node apps/api/src/server.js
```

or

```bash
npm run dev:api
```

## Database foundation (Run 5)

1. Copy env template:

```bash
cp apps/api/.env.example apps/api/.env
```

2. Install dependencies from repo root:

```bash
npm install
```

3. Generate Prisma client:

```bash
npm run db:generate --workspace @lingr/api
```

4. Apply initial migration:

```bash
npm run db:migrate --workspace @lingr/api
```

Notes:
- `DATABASE_URL` expects PostgreSQL.
- Health endpoints include a `database` object with `up/down/skipped` status.
- Set `DB_HEALTHCHECK_ENABLED=false` to bypass DB ping in local environments.

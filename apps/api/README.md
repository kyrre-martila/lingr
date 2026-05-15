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

## Deferred (intentional)

- auth/session implementation
- database/ORM
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

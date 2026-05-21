# Run 15 Prompt 4 — Pre-Deploy Hardening Feedback

## 1) Route registration status
- Safety routes are registered in `apps/api/src/routes/index.js`:
  - `POST /v1/safety/block`
  - `POST /v1/safety/report`
  - `PATCH /v1/conversations/:conversationId/pause`
- Emotional feedback route is registered:
  - `POST /v1/feedback/emotional`
- Product event routes: there are no standalone product-event ingestion endpoints in this codebase; events are currently persisted internally via service-level instrumentation (`recordProductEventOnce` and feedback submission path).

## 2) Hardening changes made
- Product event race-condition hardening:
  - Added DB-level uniqueness for one-time milestone events at `(userId, eventType)`.
  - Replaced `findFirst + create` with `create + unique-violation-safe handling` (`P2002`) in `recordProductEventOnce`.
- Safety transaction hardening:
  - Wrapped `blockUser` operations in a Prisma transaction:
    - block relation upsert
    - conversation pause updates
    - conversation safety state upserts
    - moderation event creation
  - This prevents partial completion under interruption.
- Deploy-readiness config hardening:
  - Extended `.env.example` with production-relevant session/auth and access-mode vars:
    - `LINGR_SESSION_SECRET`
    - `LINGR_EARLY_ACCESS_MODE`
    - `LINGR_INVITE_CODES`

## 3) Migrations added
- `apps/api/prisma/migrations/0021_run_15_4_product_event_uniqueness/migration.sql`
  - dedupes existing `product_events` rows by `(userId, eventType)`
  - adds unique index on `(userId, eventType)`

## 4) Files changed
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/0021_run_15_4_product_event_uniqueness/migration.sql`
- `apps/api/src/services/product-fit-service.js`
- `apps/api/src/services/safety-service.js`
- `apps/api/.env.example`

## 5) Deploy risks still remaining
- No centralized CORS policy is visible in the current API stack (`node:http` custom app), so cross-origin behavior may vary by infra defaults.
- No explicit secure cookie domain/scope configuration per environment (cookie flags are `HttpOnly`, `SameSite=Lax`, and `Secure` in prod; domain/path strategy remains minimal).
- Root workspace does not provide standardized `lint`, `typecheck`, `test` scripts, which weakens automated pre-deploy confidence gates.

## 6) Smoke confirmation
- `npm run e2e:smoke --workspace @lingr/api` passed after hardening changes.

## 7) Deployment call
- For a private beta of 3–5 users: **Yes, with caution**.
  - Core safety atomicity and product-event idempotency concerns were addressed.
  - I would still tighten explicit CORS/session-domain production config and add formal lint/typecheck/test scripts before broadening beyond tiny beta.

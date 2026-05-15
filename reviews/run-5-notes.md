# Run 5 Notes — Backend Foundation Start

## Backend structure created
- Added `apps/api` backend application shell with modular structure:
  - `src/config`
  - `src/http`
  - `src/middleware`
  - `src/routes`
- Added minimal monorepo workspace root `package.json` and `packages/shared` for cross-app contract reuse.

## Files/modules added
- `package.json` (workspace + api scripts)
- `packages/shared/package.json`
- `packages/shared/src/contracts.js`
- `apps/api/package.json`
- `apps/api/src/config/env.js`
- `apps/api/src/http/envelope.js`
- `apps/api/src/http/errors.js`
- `apps/api/src/middleware/request-context.js`
- `apps/api/src/middleware/validate-json.js`
- `apps/api/src/routes/health.js`
- `apps/api/src/routes/index.js`
- `apps/api/src/app.js`
- `apps/api/src/server.js`
- `apps/api/README.md`

## Framework/tooling decisions
- Used native Node.js `http` module for a minimal, production-oriented foundation with no premature framework or middleware sprawl.
- Added small route registry and middleware helpers to preserve clean boundaries before feature endpoints exist.
- Kept envelope/error shapes centralized in API helpers, not scattered in route handlers.

## Contract alignment notes
- Introduced shared contract module `packages/shared/src/contracts.js` as the source for API envelope status and error kind constants.
- Updated web contracts to re-export from shared contracts so envelope semantics stay aligned across web and backend foundations.
- Backend envelope and error helpers are aligned with Run 4 envelope taxonomy (`success/error` + centralized error object).

## Deferred backend work
- Auth/session validation and route authorization policy integration.
- Request body parsing + schema validation (Zod or equivalent) for domain endpoints.
- Database integration, persistence repositories, and migrations.
- Domain service implementations (profile, discovery, conversations, sparks, window, safety).
- Transport hardening (CORS, secure headers, structured logging, metrics, graceful shutdown).

## Local run/test commands
- `node apps/api/src/server.js`
- `npm run dev:api`
- `curl -i http://localhost:4000/health`
- `curl -i http://localhost:4000/status`

## Manual testing checklist
- [ ] Start API server and verify it binds to `PORT` or defaults to `4000`.
- [ ] `GET /health` returns `status: "success"` envelope and `data.status: "ok"`.
- [ ] `GET /status` mirrors `GET /health` behavior.
- [ ] Unknown route returns error envelope with route not found reason.
- [ ] `POST /health` without `application/json` returns validation error envelope.
- [ ] `x-request-id` is echoed through error/success metadata where applicable.

---

## Run 5 Extension — Web API Boundary via Mock Transport

### API boundary decisions
- Added an explicit frontend API call boundary: `UI -> service -> API client -> transport -> response envelope`.
- Standardized response handling to async-state envelopes (`success`, `error`, `loading`) at service boundaries.
- Added transport-level error categories aligned with Run 4 contracts (`validation`, `retryable`, etc.).

### Transport architecture
- Added `apps/web/src/api/mock-transport.js` with operation-based handlers and a stable request/response envelope.
- Added `apps/web/src/api/client.js` for transport-agnostic client calls and envelope-to-async-state mapping.
- Added `apps/web/src/api/envelope.js` as canonical success/failure envelope creators.

### Services migrated
- Migrated discovery service to API-client-backed transport calls.
- Migrated conversations service to API-client-backed transport calls.
- Added profile service and migrated profile experience component away from direct mock import.
- Added initial domain service shims for glimps, spark, window, compatibility, and safety.

### Remaining mock coupling
- State bootstrap modules and some onboarding/glimps authoring modules still initialize from local mock helpers.
- The data source remains mock-backed by design, but is now hidden behind the API transport boundary for migrated domains.

### Deferred backend work
- Real HTTP transport adapter.
- Backend endpoint routing and domain handler parity per operation.
- Runtime validation schemas for each request/response operation.
- Auth/session enforcement and safety-policy-backed authorization.
- Persistence repositories and database integration.

### Local testing steps
- `npm run lint --workspace apps/web`
- `npm run test --workspace apps/web`
- `npm run dev --workspace apps/web`

### Manual testing checklist
- [ ] Discovery section still renders cards, intro limits, and recommendations.
- [ ] Conversations section still renders list/detail and allows conversation switching.
- [ ] Profile experience still renders profile sections and fallback doesn’t break layout.
- [ ] Unknown API operation maps to validation-style failure envelope.
- [ ] Error envelope maps to UI-usable `status: "error"` shape.
- [ ] Loading state helpers are available for incremental async adoption.

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

# Run 5 Stabilization Fixes

## Files changed
- `packages/shared/src/contracts.js`
- `apps/api/src/http/errors.js`
- `apps/api/src/http/envelope.js`
- `apps/api/src/app.js`
- `apps/api/src/routes/index.js`
- `apps/api/src/services/profile-service.js`
- `apps/web/src/api/envelope.js`
- `apps/web/src/api/mock-transport.js`
- `apps/api/test/contracts-conformance.test.js`
- `apps/web/test/contracts-conformance.test.js`
- `reviews/run-5-notes.md`
- `reviews/review-run-5-fixes.md`

## Contract fixes
- Normalized unknown-route reason code to shared `REASON_CODES.ROUTE.UNKNOWN_ROUTE` in backend not-found handling.
- Standardized error taxonomy to shared `kind` + `reasonCode` + `retryable` envelope shape in backend and web transport.
- Removed invalid/non-shared error kind usage and centralized retryability defaults via shared `ERROR_RETRYABILITY`.

## Anonymous persistence changes
- Removed placeholder anonymous viewer upsert behavior.
- Anonymous viewers are transient: profile reads return `null` when no authenticated user is present.
- Profile mutation requires authenticated viewer context and existing user record.

## API hardening changes
- JSON enforcement moved to route-aware policy (`requiresJson`) instead of global all-route requirement.
- GET routes are explicitly non-JSON-required.
- PATCH profile route now requires auth at route protection level.
- Added centralized service-error normalization helper (`toApiError`) for API error handling.

## Tests added
- Backend conformance tests for success/error envelope and shared reason/kind taxonomy.
- Web transport conformance tests for success/error envelope taxonomy.

## ID strategy decisions
- Codified current strategy in shared contracts:
  - Internal DB IDs: Prisma `cuid()` identifiers.
  - API-facing IDs: prefixed IDs for user/profile (`usr_`, `prf_`) derived at mapper boundary.
- Profile service now maps internal IDs to API-facing prefixed identifiers.

## Intentionally deferred issues
- No new persisted domains added.
- No conversation/glimps/spark persistence added.
- No full authentication flows or provider integration added.
- No frontend redesign or realtime system work added.

## Manual testing checklist
- [ ] `GET /health` works without JSON content-type.
- [ ] Unknown routes return shared `route.unknown_route` reason code.
- [ ] Anonymous `GET /v1/profile/viewer` returns `null` data payload without persistence writes.
- [ ] Anonymous `PATCH /v1/profile/viewer` returns auth error and performs no writes.
- [ ] Authenticated profile patch requires valid existing user and returns prefixed API IDs.
- [ ] Conformance tests pass for backend/web envelope assumptions.

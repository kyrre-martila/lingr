# Run 6 Notes — Glimps Persistence Foundation

## Glimps persistence decisions
- Added first persisted product-domain model for Glimps in backend Prisma schema as `Glimps` mapped to `glimpses` table.
- Kept DB/internal IDs as Prisma `cuid()` and mapped to API-safe prefixed IDs (`glp_...`) in service DTO mapping.
- Kept internal DB row shape and client-safe DTO shape separate through explicit mapper (`toClientGlimps`).
- Did not implement realtime, Spark, Conversation, or Message persistence.

## Files/modules added
- `apps/api/src/services/glimps-service.js`
- `apps/api/src/routes/glimps.js`
- `apps/api/prisma/migrations/0002_glimps_persistence/migration.sql`
- `reviews/run-6-notes.md`

## Files/modules updated
- `apps/api/prisma/schema.prisma`
- `apps/api/src/routes/index.js`
- `apps/api/src/app.js`

## API endpoints/services created
- `POST /v1/glimps` -> create Glimps (auth required)
- `GET /v1/glimps/viewer` -> list current viewer Glimps (auth required)
- `GET /v1/glimps/:glimpsId` -> get single viewer-owned Glimps by ID (auth required)
- `PATCH /v1/glimps/:glimpsId/archive` -> archive viewer-owned Glimps (auth required)

## Validation/mapping decisions
- Service-boundary validation for:
  - required reflection/mood/privacy/emotionalTone/state
  - max lengths for text fields
  - enum guards for state/privacy/emotionalTone
  - prefixed `glp_` ID validation for lookup/archive endpoints
- API returns DTO with:
  - `glimpsId`, `userId`
  - reflection, mood, optional prompt/imageNote
  - privacy, emotionalTone, state
  - created/updated/archived timestamps
- Internal DB model fields remain backend-only; route returns mapped DTO only.

## Auth/permission assumptions
- Mutations require authenticated viewer context (`requiresAuth: true` and service-level `requireAuthenticatedViewer`).
- Anonymous writes are blocked with auth error.
- Viewer-scoped reads (`list`, `get-by-id`) are also auth-required for this foundation run.
- Ownership enforcement uses `userId` filtering in queries/updates.

## Deferred work
- No web UI redesign and no new frontend feature flows added.
- No web transport wiring for Glimps persistence yet.
- No moderation pipeline, expiration jobs, or safety-event persistence.
- No contract expansion for Glimps-specific reason codes in shared package yet.
- No pagination/filtering for Glimps list.

## Local test commands
- `node --check apps/api/src/app.js`
- `node --check apps/api/src/services/glimps-service.js`
- `node --check apps/api/src/routes/glimps.js`
- `node --test apps/api/test/contracts-conformance.test.js`

## Manual testing checklist
- [ ] Authenticated `POST /v1/glimps` creates a row and returns `201` success envelope.
- [ ] Anonymous `POST /v1/glimps` returns auth error envelope and no DB write.
- [ ] Authenticated `GET /v1/glimps/viewer` returns only viewer-owned rows.
- [ ] Authenticated `GET /v1/glimps/:glimpsId` returns viewer-owned item with `glp_` ID mapping.
- [ ] `PATCH /v1/glimps/:glimpsId/archive` sets state to `archived` and `archivedAt`.
- [ ] Invalid payloads (missing reflection/mood or bad enums) return validation error envelope.
- [ ] Invalid non-prefixed IDs return `validation.invalid_id`.

---

## Run 6 — Prompt 2: Frontend Glimps Service Boundary Integration

### Frontend service integration decisions
- Added dedicated `apps/web/src/services/glimps-service.js` to isolate Glimps API calls from UI flow logic.
- Integrated Glimps creation flow (`create-flow.js`) with async service call on confirmation while preserving the existing step-by-step UX and calm tone.
- Kept image behavior unchanged (still note-only placeholder; no upload implementation).
- Avoided exposing internal backend fields by mapping DTOs to a client-safe UI shape in the service layer.

### Transport assumptions
- Uses the existing API client/transport architecture (`api/client.js`) for backend-ready calls.
- Extended mock transport with `glimps.create` and `glimps.viewer.list` operations for local/dev fallback when backend transport is not active.
- Assumes envelope semantics remain `status: success|error` with shared `kind`, `reasonCode`, and `retryable` metadata.

### Files changed
- `apps/web/src/services/glimps-service.js` (new)
- `apps/web/src/api/mock-transport.js`
- `apps/web/src/components/glimps/create-flow.js`
- `apps/web/test/glimps-service.test.js` (new)
- `reviews/run-6-notes.md`

### Behavior preserved
- Existing Glimps creation steps, validation flow, and screen-reader announcement behavior are preserved.
- Existing local draft and preview interactions remain intact.
- No UI redesign, no new feature surfaces, and no public-feed/engagement mechanics added.

### Error states handled
- Loading state during submit (`Saving...` and controls disabled).
- Success state with calm confirmation messaging.
- Validation error state.
- Permission/auth error state.
- Retryable/domain error state with retry guidance.
- Non-retryable fallback error state while keeping draft safe in the current session.

### Deferred work
- Real HTTP transport wiring to backend Glimps endpoints.
- Viewer Glimps list UI rendering (service support added; UI list remains deferred until product asks for it).
- Image upload.
- Public feeds.
- Likes/reactions/engagement mechanics.

### Local test commands
- `npm run test --workspace apps/web`
- `node --test apps/web/test/contracts-conformance.test.js`
- `node --test apps/web/test/glimps-service.test.js`

### Manual testing checklist
- [ ] Complete Glimps flow with valid reflection + mood and confirm save state appears.
- [ ] Submit without required fields and confirm validation guidance appears.
- [ ] Simulate auth/permission failure and confirm signed-in guidance appears.
- [ ] Simulate retryable failure and confirm retry guidance appears.
- [ ] Confirm after failure that draft content remains available.
- [ ] Confirm keyboard flow and aria-live messaging still work across step transitions and submission outcomes.


## Run 6 — Prompt 4: Stabilization updates
- Added shared Glimps constants/reason codes/id prefix in `packages/shared/src/contracts.js`.
- Updated API Glimps service to use shared contract constants for state/privacy/tone and not-found reason code.
- Made archive behavior explicit and idempotent for already-archived records.
- Removed frontend/mock state drift (`shared`) and aligned create payload to backend-supported `published` state.
- Added backend service tests for auth rejection, validation rejection, archive idempotency, and not-found reason code behavior.

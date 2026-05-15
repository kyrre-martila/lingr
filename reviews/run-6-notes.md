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

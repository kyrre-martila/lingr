# Run 11.7.11 — Spark inbox/listing mismatch

## Root cause
The smoke runner assumed the first discovery introduction always represented account B and then validated B inbox visibility against that assumption. In environments where discovery may return multiple intros, this could point Spark creation at a different recipient and cause `GET /v1/sparks/viewer` for B to legitimately miss the created Spark.

## Spark lifecycle semantics found
- Spark creation route used by discovery: `POST /v1/discovery/spark`.
- Discovery spark creation delegates to `createSparkInvitation` and creates the Spark in `invited` state.
- Spark fields are persisted as internal IDs (`initiatorUserId`, `recipientUserId`) and exposed as prefixed external IDs (`usr_*`, `spk_*`).
- Viewer listing endpoint is `GET /v1/sparks/viewer`; it returns all viewer-visible sparks (initiated or received), newest first, in `data` as an array of Spark DTOs.
- Recipient incoming visibility should be asserted by matching both `sparkId` and recipient user external ID for the authenticated B viewer.

## Fix made
- Smoke runner now reads B's authenticated viewer profile (`GET /v1/profile/viewer`) to obtain B's external user ID.
- Discovery step now prefers the introduction entry matching B's user ID when available, falling back to first intro only if needed.
- Incoming Spark assertion now matches `recipientUserId === viewerBUserId` (actual B identity), not the previously assumed discovery-selected ID.
- Added targeted diagnostics that run only when B cannot find the Spark in listing, including:
  - created Spark ID/state/initiator/recipient from Prisma,
  - all Spark rows involving A/B from Prisma,
  - B list response body,
  - B authenticated viewer identity (from profile/meta context).

## Pass/fail table
| Step | Result |
|---|---|
| db migrate/seed | PASS |
| api health | PASS |
| register/login A+B | PASS |
| profile setup/readiness A+B | PASS |
| discovery A | PASS |
| spark creation from discovery | PASS |
| B lists incoming Sparks | PASS |
| B accepts Spark | **FAIL** (`500 domain.unexpected`) |

## Next blocker
After inbox/listing alignment is corrected, the next blocker is Spark accept mutation failure (`PATCH /v1/sparks/:sparkId/accept` returning `500 domain.unexpected`), which appears downstream of this run's inbox mismatch scope.

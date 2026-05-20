# Run 11.7.8 — Profile Update Write Path Fix

## Root cause
`PATCH /v1/profile/viewer` failed with `500 domain.unexpected` because `profile-service` called `getDbClient()` without awaiting it. The DB client factory is async, so `db` was a Promise and `db.user.findUnique` crashed with:

- `TypeError: Cannot read properties of undefined (reading 'findUnique')`

This happened before domain/validation handling and surfaced as generic unexpected server error.

## Fix
Updated `apps/api/src/services/profile-service.js` to:

1. Await DB client initialization in profile read/update paths.
   - `const db = await getDbClient()`
2. Improve profile update payload semantics.
   - Reject non-object payloads with `400` `validation.invalid_payload`.
3. Improve write-path error semantics.
   - Map Prisma validation/known request errors to `400` `validation.invalid_payload` instead of generic `500`.

## Profile payload shape (minimum for discovery readiness in smoke)
Smoke now uses (unchanged payload shape; confirmed valid):

- `displayName` (required, <= 80)
- `pronouns` (optional nullable, <= 50)
- `ageRange` (optional nullable, <= 20)
- `bio` (optional nullable, <= 300)
- `layersSummary` (optional nullable, <= 300)
- `locationRegion` (optional nullable, <= 120)
- `avatarAssetId` (optional nullable, <= 120)

Discovery readiness threshold remains completeness >= 80, based on persisted profile fields.

## Smoke pass/fail table
| Step | Result |
|---|---|
| db migrate | PASS |
| seed region | PASS |
| api health | PASS |
| register/login A+B | PASS |
| profile setup A/B | PASS |
| profile readiness A/B | PASS |
| discovery A | PASS |
| spark creation | PASS |

## Next blocker
No blocker in this run. Smoke reached and passed discovery + spark creation.

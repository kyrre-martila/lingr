# Run 11.7.7 — Profile readiness blocker

## Root cause
- The smoke runner called profile readiness for newly registered users that only have bootstrap profile data.
- Readiness semantics were weak: `/v1/profile/completeness` could return null-like readiness state and did not emit an explicit expected domain reason for incomplete onboarding.
- E2E also did not populate required profile fields before readiness/discovery checks.

## Fix
1. **Profile completeness semantics hardened**
   - `getViewerProfileCompleteness` now returns explicit completeness metadata (`requiredFields`, `missingFields`) and returns `reasonCode=discovery.profile_incomplete` when profile completeness is below readiness threshold.
   - If profile data is unavailable, endpoint now returns expected domain error (`403 discovery.profile_incomplete`) instead of bubbling as generic unexpected.
2. **Smoke runner setup updated using real API**
   - Added `profile setup A/B` step that calls `PATCH /v1/profile/viewer` with minimum valid fields required for readiness.
   - This preserves product rules (no bypass/mocking) and uses persisted onboarding/profile data.

## Required readiness fields (current backend logic)
Profile completeness is computed from:
- `displayName`
- `bio`
- `pronouns`
- `ageRange`
- `layersSummary`
- `locationRegion`
- `avatarAssetId` (represented as `avatarUrl` in API profile view)

Readiness threshold remains completeness >= 80.

## Smoke run table (latest)

| Step | Result | Notes |
|---|---|---|
| db migrate | PASS | No pending migrations. |
| seed region | PASS | NO/trondelag open. |
| api health | PASS | API boot healthy. |
| register/login A+B | PASS | Sessions established. |
| profile setup A | **FAIL** | HTTP 500 `domain.unexpected` persists on `PATCH /v1/profile/viewer`. |
| profile readiness A | NOT RUN | Blocked by profile setup failure. |
| discovery A | NOT RUN | Blocked. |

## Next blocker
- `PATCH /v1/profile/viewer` returns `500 domain.unexpected` during legitimate onboarding profile update.
- Next run should isolate profile update write path (Prisma error mapping + payload/column constraints) so readiness can proceed to discovery.

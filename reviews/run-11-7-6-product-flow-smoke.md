# Run 11.7.6 — Product-flow smoke progression

## Command
- `npm run e2e:smoke --workspace @lingr/api`

## Step-by-step pass/fail

| Step | Result | Notes |
|---|---|---|
| db migrate | PASS | Prisma migrations applied through `0016_run_11_7_1_profile_schema_sync`. |
| seed region | PASS | Seed script confirmed NO/trondelag open. |
| api health | PASS | `/health` returned healthy status. |
| register A | PASS | Account created or already present accepted. |
| login/session A | PASS | Session cookie returned. |
| register B | PASS | Account created or already present accepted. |
| login/session B | PASS | Session cookie returned. |
| profile readiness A | **FAIL** | HTTP 500 with `reasonCode=domain.unexpected`. |
| profile readiness B | NOT RUN | Stopped at first real blocker. |
| discovery A | NOT RUN | Blocked by profile-readiness step. |
| spark creation | NOT RUN | Blocked by discovery. |
| mutual spark | NOT RUN | Blocked by spark creation. |
| conversation exists | NOT RUN | Blocked by mutual spark. |
| message exchange | NOT RUN | Blocked by conversation creation. |
| chat apps smoke route | NOT RUN | Blocked by conversation creation. |
| logout/login persistence | NOT RUN | Blocked by earlier product step. |

## First product blocker
- **Blocker step:** `profile readiness A`
- **Observed failure:** `FAIL profile readiness A: 500 domain.unexpected`
- **Category:** **product bug** (server returned unexpected-domain 500 for `/v1/profile/completeness` on authenticated account that just registered/logged in).

## Exact error
- HTTP status: `500`
- reasonCode: `domain.unexpected`
- route: `GET /v1/profile/completeness`

## Required readiness fields (current product logic)
Discovery requires viewer lifecycle state to be `active`; onboarding/incomplete users are blocked. Current readiness logic is tied to profile completeness (>=80) and includes:
- `displayName`
- `bio`
- `pronouns`
- `ageRange`
- `layersSummary`
- `locationRegion`
- `avatarAssetId`

This is inferred from profile completeness computation and discovery readiness checks in backend services.

## Next recommended fix
1. Fix `/v1/profile/completeness` happy path for freshly registered accounts (it should not return 500).
2. After route stability, ensure smoke updates the minimum persisted profile fields via real `PATCH /v1/profile/viewer` values so lifecycle becomes active for discovery.
3. Rerun smoke and continue to discovery/spark/conversation/message/chat-app/logout persistence until the next first real blocker.

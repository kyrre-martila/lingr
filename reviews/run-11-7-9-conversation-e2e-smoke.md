# Run 11.7.9 — Conversation E2E smoke progression

## Smoke command
- `npm run e2e:smoke --workspace @lingr/api`

## Pass/Fail table (latest run)

| Step | Result | Notes |
|---|---|---|
| db migrate | PASS | Prisma migrations complete. |
| seed region | PASS | E2E seed ran (`NO/trondelag`). |
| api health | PASS | `/health` OK. |
| register/login A+B | PASS | Both accounts created and authenticated. |
| profile setup A/B | PASS | `PATCH /v1/profile/viewer` successful for both. |
| profile readiness A/B | PASS | `/v1/profile/completeness` successful for both. |
| discovery A | **FAIL** | `state=empty reasonCode=discovery.no_available_people introductions=0`. |
| spark creation onward | NOT RUN | Stopped at first real blocker per fail-fast policy. |

## First blocker
- **Step:** discovery A
- **Route:** `GET /v1/discovery/daily`
- **Error:** `state=empty reasonCode=discovery.no_available_people introductions=0`
- **Status:** HTTP 200 response with empty discovery state (no eligible introductions), so smoke cannot proceed to Spark/conversation IDs safely.

## What was changed in this run
1. Extended smoke runner logic (after spark creation) with explicit PASS/FAIL gated steps for:
   - incoming sparks listing (B)
   - spark accept (B)
   - mutual spark confirmation
   - conversation creation/retrieval
   - A/B message send + message listing
   - trust progression feasibility check
   - chat-app route smoke checks (match cards / guess me / snuggle)
   - logout + login persistence + conversation re-access
2. Added strict structured failure context for route/status/reason/body capture to avoid continuing with invalid IDs.
3. Added per-run unique account emails (`smoke-a-<runId>@...`, `smoke-b-<runId>@...`) to reduce cross-run state collisions.

## Routes covered by runner extension
- `GET /v1/sparks/viewer`
- `PATCH /v1/sparks/:sparkId/accept`
- `GET /v1/sparks/:sparkId`
- `POST /v1/conversations`
- `POST /v1/conversations/:conversationId/messages`
- `GET /v1/conversations/:conversationId/messages`
- `POST /v1/chat-apps/invite`
- `POST /v1/auth/logout`
- `POST /v1/auth/login`
- `GET /v1/conversations/:conversationId`

## Layer 2/3 unlock timing note
- No production defaults were changed.
- Full Layer 2/3 progression remains dependent on timing/trust gates and may require longer-run/manual progression.

## Backend readiness for manual browser testing
- **Partially ready.** Core bootstrap/auth/profile endpoints are healthy, but this run’s current seeded/user state hit a discovery availability blocker before Spark-to-conversation flow could be exercised end-to-end in this execution.

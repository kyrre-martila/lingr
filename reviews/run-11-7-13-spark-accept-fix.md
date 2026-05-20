# Run 11.7.13 — Spark accept fix

## Root cause (with server exception)
- Smoke failure occurred at `PATCH /v1/sparks/:sparkId/accept` with HTTP 500 and `domain.invalid_query`.
- Server-side stack trace showed `PrismaClientKnownRequestError` from `syncLayerAfterMutualSpark` during Spark acceptance.
- Prisma error: missing `relationship_layers.trust_score`, then missing `relationship_layers.last_counted_message_at`.
- Cause: migration/schema column-name drift in `relationship_layers` (camelCase columns created in prior migrations while Prisma model maps to snake_case columns).

## Fix made
- Added migration `0017_run_11_7_13_relationship_layer_trust_score_column_fix`:
  - renames `trustScore` -> `trust_score` when present
  - ensures `trust_score` exists
  - includes defensive rename/add for `lastCountedMessageAt` -> `last_counted_message_at`
- Added migration `0018_run_11_7_13_relationship_layer_last_counted_column_fix`:
  - explicit/defensive rename+add for `last_counted_message_at`
- This restores compatibility so Spark accept can complete layer sync and continue to conversation wiring.

## Tests added
- `recipient can accept incoming spark and gets valid dto`
- `accept creates conversation when missing`
- `accept reuses conversation when present`
- `duplicate accept is idempotent`

## Smoke pass/fail table
| Step | Before | After |
|---|---|---|
| B accepts Spark | FAIL (500 domain.invalid_query) | PASS |
| Mutual Spark state | BLOCKED | PASS |
| Conversation exists/is created | BLOCKED | PASS |
| Message flow | BLOCKED | PASS |
| Chat apps checks | BLOCKED | PASS |
| Relogin persistence | BLOCKED | PASS |

## Next blocker
- None observed in this run; smoke completed end-to-end after migration fix.

# Run 6 Spark Stabilization Fixes

## Files changed
- `packages/shared/src/contracts.js`
- `apps/api/src/services/spark-service.js`
- `apps/api/src/prisma/schema.prisma`
- `apps/api/src/prisma/migrations/0004_spark_pair_uniqueness/migration.sql`
- `apps/api/test/spark-service.test.js`
- `reviews/run-6-notes.md`

## Transition policy decisions
- Codified explicit transition matrix in shared contracts.
- Allowed transitions:
  - potential -> invited
  - invited -> accepted|paused|declined|expired
  - paused -> accepted|declined
  - accepted -> paused
- Declined and expired are terminal states and reject all outgoing transitions.
- Invalid transitions return `spark.invalid_state_transition`.

## Actor permission decisions
- Codified action model:
  - create: authenticated initiator
  - accept: recipient only
  - pause: initiator or recipient
  - decline: initiator or recipient
  - read: initiator or recipient
- Unauthorized attempts map to `permission.not_allowed`.

## Duplicate prevention strategy
- Introduced canonical pair identity with `pairMinUserId` and `pairMaxUserId`.
- Added DB-level partial unique index on canonical pair for active statuses (`invited|accepted|paused`).
- Service maps Prisma unique conflict (`P2002`) to `spark.duplicate_active_spark`.
- This prevents bidirectional duplicates and race-condition duplicates in create.

## ID normalization decisions
- `recipientUserId` now requires API-facing `usr_` prefixed IDs and is normalized at service boundary.
- Optional `sourceGlimpsId` requires `glp_` prefixed IDs.
- Invalid IDs map to `validation.invalid_id`.

## Reference validation changes
- Create validates recipient existence before write.
- Create validates optional source Glimps existence.
- Source Glimps visibility guard:
  - allowed if source belongs to initiator, or
  - belongs to recipient and is not private.
- Failures map to canonical Spark reason codes:
  - `spark.invalid_recipient_reference`
  - `spark.invalid_source_glimps_reference`

## Tests added
- Spark create ID normalization test (`usr_` required).
- Duplicate prevention test via DB unique conflict mapping.
- Invalid recipient reference test.
- Invalid source Glimps reference test.
- Actor permission tests (accept recipient-only, pause participant).
- Transition matrix invalid-edge tests (accepted->declined rejected, terminal transitions rejected).

## Issues intentionally deferred
- Request-triggered expiration mutation remains placeholder behavior on list.
- No scheduler/background lifecycle executor added in this run.
- No Spark frontend redesign.
- No Conversation/Message persistence.
- No realtime orchestration.

## Manual testing checklist
- [ ] Create Spark with valid `usr_` recipient ID succeeds.
- [ ] Create Spark with invalid recipient ID prefix returns `validation.invalid_id`.
- [ ] Create Spark with missing recipient user returns `spark.invalid_recipient_reference`.
- [ ] Create Spark with invalid `glp_` source returns `spark.invalid_source_glimps_reference`.
- [ ] Concurrent duplicate creates for same pair return one success + one duplicate conflict.
- [ ] Accept is allowed only for recipient.
- [ ] Pause/decline are allowed for either participant.
- [ ] Terminal states reject further transitions with `spark.invalid_state_transition`.

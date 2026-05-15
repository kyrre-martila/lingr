# Run 6 Review — Spark Persistence

## 1) Summary
Run 6 Spark persistence is a meaningful step forward: there is now a persisted Spark domain with explicit auth-gated routes, viewer-scoped reads, state constants shared through `packages/shared`, and a DTO mapper that keeps internal DB fields out of client responses.

The foundation is solid, but it is not yet stabilization-complete. The largest risks are transition-policy looseness (especially `pause`), API-level payload/ID boundary ambiguity, and duplicate-prevention robustness under concurrent writes.

Overall assessment: **good foundation, medium stabilization quality, needs lifecycle and boundary hardening before broader rollout.**

---

## 2) What is working well

1. **State vocabulary is shared across layers**
   - Spark states and reason codes are now represented in shared contracts (`SPARK_STATE`, `REASON_CODES.SPARK`), reducing hardcoded drift risk.

2. **Auth/viewer safety is enforced in both route and service layers**
   - Spark routes require auth and service methods also enforce authenticated viewer presence.

3. **Self-Sparks are explicitly blocked**
   - The create flow rejects initiator==recipient, with a specific reason code.

4. **Duplicate-active relationship protection exists**
   - Create checks both user directions and blocks creation when an active Spark already exists.

5. **DTO redaction boundary is present and clear**
   - Responses return mapped client fields (`sparkId`, prefixed user IDs, timestamps) rather than raw Prisma rows.

6. **Reason-code envelope usage is mostly consistent**
   - Not found, invalid transition, self-spark, and duplicate states map to shared reason codes and appropriate status classes.

---

## 3) Main concerns

1. **Transition policy is too permissive/implicit**
   - `updateSparkStatus` only blocks from terminal declined/expired and allows broad cross-transitions otherwise. This can permit unclear semantics (e.g., accept from paused, decline after accept).

2. **Duplicate-prevention is application-level only**
   - `findFirst` + `create` is race-prone under concurrent requests and needs DB-level uniqueness/locking strategy for true safety.

3. **API input boundary is under-specified for IDs**
   - `recipientUserId` and `sourceGlimpsId` are consumed as raw strings in service create path, while retrieval routes enforce prefixed IDs (`spk_`). This mixed policy can confuse clients and increase adapter drift.

4. **Placeholder expiration logic mutates global state during list**
   - `listViewerSparks` expires all overdue invites before returning viewer rows. This can create surprising side effects and noisy write load on read paths.

---

## 4) Persistence concerns

1. **Schema coverage is reasonable but lifecycle constraints are weak**
   - Table/model includes key lifecycle timestamps, but there are no DB-level checks tying timestamps to status transitions (e.g., `declinedAt` only when declined).

2. **No durable DB guard against duplicate active relationship**
   - Current index strategy supports querying, but does not enforce uniqueness of active Spark pairs.

3. **Recipient/source foreign boundary not validated at domain layer**
   - If a `recipientUserId` or `sourceGlimpsId` is malformed/non-existent, failure may be deferred to DB constraint errors rather than returning stable domain reason codes.

4. **Expiration strategy is opportunistic rather than deterministic**
   - Request-triggered bulk update in list path is okay as placeholder, but not stable policy for production lifecycle correctness.

---

## 5) API concerns

1. **Envelope taxonomy looks correct, but some domain failures likely collapse to generic errors**
   - Missing pre-validation for external references can produce infra-shaped errors instead of canonical Spark reason codes.

2. **Accept/pause/decline permissions are not fully differentiated**
   - `accept` is recipient-only (good), while `pause` and `decline` are participant-allowed. That may be intended, but should be explicit in product contract because it materially affects trust and interaction tone.

3. **State transition semantics are not contract-declared**
   - Clients cannot reliably predict legal transitions from current state because no explicit transition matrix is codified in shared contracts.

4. **ID policy asymmetry remains**
   - Spark lookup requires `spk_` prefix; create does not require prefixed recipient/source IDs. This asymmetry should be deliberate and documented or normalized.

---

## 6) Auth/permission concerns

1. **Core auth gating is good**
   - Anonymous create/list/read/mutate are blocked by layered protections.

2. **Participant scoping is correct for read-by-id and status updates**
   - Only initiator/recipient can read or mutate a Spark.

3. **Permission model for decline/pause may be too broad without policy text**
   - Allowing initiator and recipient both to decline/pause can be valid, but if not explicitly intentional, it may create consent ambiguity.

4. **No explicit checks for blocked/restricted relationship policy**
   - If broader safety overlays are expected, Spark mutation paths currently do not show additional policy hooks.

---

## 7) Contract consistency concerns

1. **Shared contract alignment improved significantly**
   - Spark states/reason codes and ID prefix are in shared contracts, which is the right direction.

2. **Transition rules are not represented in shared contract authority**
   - States exist, but legal transition paths do not; backend behavior is implicit code policy.

3. **Potential ID-format mismatch risk for create payload**
   - If clients assume all API user IDs are prefixed (`usr_`), create currently accepts raw DB-like IDs in service logic; this should be clarified or normalized.

4. **Reason-code coverage still incomplete for reference validation**
   - No dedicated shared reason codes for invalid recipient/source reference integrity errors.

---

## 8) Philosophy alignment concerns

1. **Mostly aligned with Lingr tone: relationship-first, not engagement-first**
   - There are no likes, counters, streaks, or public-feed mechanics added here.

2. **Risk of gamification is currently low**
   - The model focuses on private invitation lifecycle and consent states.

3. **One caution: `potential` state exists without visible behavior contract**
   - If later surfaced as score-like or ranking-like mechanics, it could drift toward swipe/match framing; keep it as gentle internal lifecycle only unless explicitly product-approved.

---

## 9) Suggested stabilization plan

### Phase A — Transition policy hardening (P0)
1. Define explicit allowed transitions matrix (e.g., invited -> accepted|paused|declined|expired; paused -> accepted|declined; accepted -> paused only, etc.).
2. Enforce transition matrix in service and add focused tests for all invalid edges.
3. Decide and document actor permissions per action (initiator vs recipient) for pause/decline.

### Phase B — Duplicate and integrity hardening (P0/P1)
1. Add DB-level strategy to prevent duplicate active Spark pairs under race (partial unique index or canonical pair key + active constraint strategy).
2. Normalize user-pair ordering or introduce deterministic pair identity to simplify uniqueness.
3. Validate recipient/source references pre-write and map failures to stable Spark/domain reason codes.

### Phase C — API/contract boundary alignment (P1)
1. Normalize ID contract for create payloads (`usr_`/`glp_` parsing + validation) or formally document internal-ID acceptance if intentional.
2. Add shared reason codes for invalid recipient/source references and transition permission violations if needed.
3. Add conformance tests for Spark envelopes and redacted DTO shape similar to earlier profile/glimps stabilization.

### Phase D — Lifecycle execution strategy (P2)
1. Move expiration from read-time mutation toward deterministic job/scheduler or transactional mutation boundary.
2. Add observability for Spark create/transition rejection reasons to catch policy friction early.

---

## 10) Prioritized next steps

### P0 (before broad client rollout)
1. Codify and enforce Spark transition matrix + actor permissions.
2. Add race-safe duplicate-active prevention at DB level.
3. Add tests for transition validity and permission-specific paths (`accept`, `pause`, `decline`).

### P1
1. Normalize ID input policy for create payload fields.
2. Add deterministic error mapping for invalid recipient/source references.
3. Add backend contract-conformance tests for Spark routes and DTO redaction boundaries.

### P2
1. Replace request-triggered expiration placeholder with explicit lifecycle executor.
2. Add metrics/logging for Spark rejection reason codes to support product/safety tuning.

# Run 4 Review — Architecture Readiness (API, Auth, Persistence)

## 1) Summary
Run 4 establishes a strong planning baseline: the team now has explicit contract vocabulary, service-layer intent, auth/session ownership language, and a database-ready entity map. The direction is largely sound and practical for phased delivery.

However, the architecture is **not yet implementation-stable** in several critical seams:
- DTO shape ownership and versioning are not yet codified in executable contracts.
- Several domain boundaries still overlap (`window` vs `safety`, `spark` vs `compatibility`, `auth` vs `session` vs `account state`).
- A few persistence assumptions are optimistic for early scale (index breadth, unique/partial index dependence, pair-only conversation assumptions).
- API portability is conceptually good, but migration risk remains high unless mock adapters are enforced and feature modules stop bypassing service boundaries.

Overall assessment: **good architecture direction, medium readiness**. The next step should be stabilization and contract codification—not new features.

---

## 2) What is working well

1. **Cross-document consistency improved meaningfully**
   - Run 4 docs use shared ID/timestamp conventions and a mostly coherent domain vocabulary.
   - Client-safe vs internal-only fields are explicitly considered in data contracts and persistence notes.

2. **Service boundary intent is strong**
   - The domain service split in API architecture is practical for incremental mock → backend migration.
   - Async envelope and error taxonomy planning helps avoid ad-hoc UI error handling.

3. **Auth/session planning avoids provider lock-in**
   - Composed state modeling (auth axis + account lifecycle axis) is better than a monolithic enum approach.
   - Route outcomes (`allow` / `soft_block` / `hard_block`) are a good policy shape for future backend ownership.

4. **Persistence modeling is mature for a pre-implementation phase**
   - Core entities and relationship direction are reasonable.
   - Moderation/safety audit requirements are recognized early, which prevents costly retrofits.

---

## 3) Main architecture concerns

1. **Contracts remain prose-first, not runtime-enforced**
   - Nearly all stability depends on documentation discipline. Without shared validators/constants, drift is likely once implementation begins.

2. **Boundary overlap could produce inconsistent policy outcomes**
   - `conversation_windows` and `safety_events` both influence pacing/restrictions but ownership of final message eligibility isn’t explicitly singular.
   - `sparks` readiness and `compatibility_snapshots` recommendation language can conflict if not mapped through one policy layer.

3. **Versioning strategy is under-specified**
   - There is mention of `v1` envelope direction, but no explicit compatibility guarantees (additive-only fields, enum deprecation strategy, unknown-field handling).

4. **Read-model vs write-model distinction is still blurry**
   - Docs define entity shapes and API DTO ideas, but do not clearly separate transactional writes from client-optimized read projections.

---

## 4) API concerns

1. **Mock → backend migration is realistic, but only if adapter discipline is enforced**
   - If feature code keeps calling mock factories directly (a known prior risk from earlier runs), transport abstraction will be bypassed and migration cost will spike.

2. **Transport neutrality is good, but envelopes are slightly over-generalized for current stage**
   - A single canonical envelope for all domains can become rigid. Keep shared base envelope minimal and let domains extend where needed.

3. **Error taxonomy needs explicit mapping ownership**
   - Who maps infra exceptions to domain/public errors (transport adapter vs domain service) should be fixed now to avoid duplicated logic.

4. **Contract package ownership is not assigned**
   - The docs mention future shared contract codification, but no single module authority is declared (e.g., `domain/contracts` as the sole source).

Practical recommendation:
- Gate all UI data access through domain clients/services immediately (even with mocks).
- Add runtime schema guards at service boundaries before backend integration starts.

---

## 5) Auth concerns

1. **Ownership model is good, but enforcement ordering is unclear**
   - Route access, permissions, and safety overlays are all defined conceptually; the decisive precedence order should be explicit.
   - Suggested precedence: `auth validity -> account lifecycle -> safety overlay -> feature-level permissions -> route outcome`.

2. **Reason-code taxonomy should be unified now**
   - Route blocks, safety restrictions, and moderation states should share a constrained reason-code namespace to avoid fragmented UX messaging.

3. **Session contract may still leak feature concerns**
   - Ensure session remains a viewer/context snapshot; feature modules should consume derived permissions rather than infer lifecycle/auth details independently.

4. **Future provider portability risk**
   - Good intent exists, but unless provider claims are normalized at ingress adapters only, downstream services will accidentally couple to provider-specific claims.

---

## 6) Persistence concerns

1. **Entity relationships are sensible, with one major forward-compat caveat**
   - `conversations` modeled as participantA/participantB is okay now, but migration to participant-join model should be treated as likely, not optional.

2. **Indexing assumptions are mostly realistic, but partial/nullable uniqueness may vary by datastore**
   - Plans relying on partial unique indexes (e.g., current snapshot uniqueness or nullable uniqueness semantics) need portability fallback strategies.

3. **Privacy boundaries are directionally safe but need hard redaction layers**
   - Internal moderation/safety fields are clearly labeled; this is excellent.
   - Still, safety depends on implementation of explicit outbound mappers—not entity-level direct serialization.

4. **Soft-delete strategy needs retention policy timing**
   - Soft-delete-first is appropriate, but retention/purge SLAs should be defined early to avoid legal/compliance debt.

5. **Audit/event growth strategy not yet operationalized**
   - `safety_events` and moderation/event logs can grow quickly; plan partitioning/archival boundaries early.

---

## 7) Domain consistency concerns

Run 3 domain boundaries largely fit Run 4 plans, but these seams need tightening:

1. **Spark vs compatibility semantics**
   - Keep `spark` as participant intent/action object.
   - Keep `compatibility` as system interpretation snapshot.
   - Avoid mixing recommendation language into spark state transitions.

2. **Window vs safety semantics**
   - `conversation_window` should own pacing state.
   - `safety` should own policy/risk signals and restrictions.
   - A single policy resolver should combine them for message eligibility.

3. **Profile completeness ownership**
   - Auth/session docs reference completeness-derived state; persistence docs place completeness in profile.
   - Lock one source of truth (profile projection) and derive session claims from it.

4. **Moderation state vocabulary**
   - Ensure `glimps.moderationState`, message visibility/redaction states, and safety resolution states are mapped, not duplicated semantically.

---

## 8) Mobile readiness

Mobile portability is **promising but not guaranteed** yet.

What supports mobile reuse:
- Platform-neutral contract and service vocabulary direction.
- Auth/session policy outputs framed as consumable results (`allow/soft_block/hard_block` + reasons).

What still blocks smooth React Native reuse:
- No executable shared contract package yet.
- Potential drift in error mapping and async envelopes if web implements first without shared test fixtures.
- Transport abstraction remains conceptual unless mobile/web both consume the same domain client interface with adapter injection.

Practical readiness score: **6.5/10**.

---

## 9) Overengineering risks

1. **Too many conceptual layers before enforcing one path**
   - Contracts + envelopes + transport adapters + service interfaces + policy overlays are all reasonable, but risk becoming ceremony if not implemented incrementally with strict ownership.

2. **Premature universality in persistence**
   - Extensive future-proofing (many enums/states/event models) may outpace actual product flows.

3. **Compatibility and safety abstractions may be over-broad early**
   - Keep initial models minimal and additive; avoid building full rule engines before basic backend persistence and auth guards are live.

4. **Route policy sophistication could outrun current app needs**
   - `soft_block/hard_block` is useful; avoid excessive subtypes/reason codes before first production flows validate requirements.

What should wait until later:
- Advanced multi-provider account linking internals.
- Full moderation event analytics modeling beyond minimum audit trail.
- Group-conversation generalization unless roadmap requires it soon.
- Complex compatibility history explainability features beyond current snapshot needs.

---

## 10) Suggested stabilization plan

### Phase A — Contract Codification (immediate)
1. Create a shared executable contract module (constants + runtime validators).
2. Freeze enum/reason-code registries with additive-change rules.
3. Add golden fixtures for each domain DTO (success/failure, client-safe/internal shapes).

### Phase B — Service Boundary Enforcement
1. Enforce “no direct mock access” in feature modules; only domain services may access adapters.
2. Implement adapter test harnesses to validate mock and backend adapters against same contract tests.
3. Add error mapping conformance tests per domain.

### Phase C — Auth/Policy Consolidation
1. Implement a single policy resolver that composes auth lifecycle, safety overlay, and route intents.
2. Ensure policy resolver emits canonical reason codes.
3. Add route guard regression tests for anonymous/onboarding/active/paused/restricted scenarios.

### Phase D — Persistence Hardening Prep
1. Define minimal viable indexes only for v1 flows (inbox, message timeline, discovery listing, spark inbox).
2. Lock redaction mapper boundaries before first API exposure.
3. Document retention/purge policy placeholders and ownership.

---

## 11) Prioritized next steps

### P0 (must do before backend integration)
1. Codify Run 4 contracts into executable shared module and fixtures.
2. Establish canonical reason-code registry shared across auth/route/safety outcomes.
3. Enforce domain service boundaries so mocks/backends are swappable without UI rewrites.

### P1
1. Define policy precedence and implement one resolver contract.
2. Add DTO conformance tests for all primary entities and API envelopes.
3. Lock client-safe redaction mappers and ban direct entity serialization.

### P2
1. Reduce persistence scope to “v1 critical indexes” and defer non-essential optimizations.
2. Document pair-conversation migration trigger conditions to participant-join model.
3. Align compatibility/spark terminology in one glossary used by API + persistence docs.

### P3
1. Add shared mobile/web contract test pack (same fixtures, same expected errors).
2. Expand advanced moderation analytics and compatibility history only after core production telemetry validates need.

---

## Concrete files reviewed
- `reviews/review-run-1.md`
- `reviews/review-run-1-fixes.md`
- `reviews/review-run-2.md`
- `reviews/review-run-2-fixes.md`
- `reviews/review-run-3.md`
- `reviews/run-3-notes.md`
- `reviews/run-3-domain-boundaries.md`
- `reviews/run-4-data-contracts.md`
- `reviews/run-4-api-architecture.md`
- `reviews/run-4-auth-foundation.md`
- `reviews/run-4-persistence-plan.md`
- `reviews/run-4-notes.md`

# Run 6 Review — Glimps Persistence

## 1) Summary
Run 6 makes meaningful progress by introducing a persisted Glimps backend domain with explicit service-layer DTO mapping, viewer scoping, and auth-required routes. The direction is strong and consistent with the Run 5 stabilization intent.

However, this implementation is **not yet stabilization-complete**. The largest risks are:
- contract drift between frontend and backend Glimps state semantics,
- missing shared reason-code authority for new domain errors,
- weak archive semantics (idempotency + domain guardrails),
- incomplete test coverage for backend route/auth/ownership behavior,
- and schema/service enum duplication that can drift.

Overall: **good foundation, medium quality, but still needs boundary hardening before broader rollout or mobile consumers.**

---

## 2) What is working well

1. **Clear backend service boundary with DTO mapping**
   - `apps/api/src/services/glimps-service.js` cleanly maps DB rows to client-safe DTOs via `toClientGlimps` and avoids returning raw Prisma entities.
   - Internal IDs are converted to `glp_` external IDs, and user IDs are converted to API-safe prefixed IDs.

2. **Auth/viewer gating is enforced at multiple layers**
   - Routes are configured with `requiresAuth: true` for all Glimps endpoints in `apps/api/src/routes/index.js`.
   - Service-level `requireAuthenticatedViewer` in `glimps-service.js` provides a second protection layer against anonymous writes/reads.

3. **Ownership rules are mostly correct**
   - List/read/archive operations include `userId` scoping in query filters.
   - This prevents cross-user reads and updates in normal path execution.

4. **Frontend service boundary exists and is reusable**
   - `apps/web/src/services/glimps-service.js` mediates UI ↔ API data mapping and avoids direct component coupling to raw transport shape.

5. **UX preservation in create flow is handled thoughtfully**
   - `apps/web/src/components/glimps/create-flow.js` keeps loading, success, validation, auth, retryable, and fallback error states visible and calm.

---

## 3) Main architecture concerns

1. **Shared contract authority is incomplete for Glimps domain errors**
   - Backend returns raw `'glimps.not_found'` string reason codes directly in service code.
   - These reason codes are not centralized in `packages/shared/src/contracts.js`, which increases drift risk across clients.

2. **Enum/validation duplication across layers without single source**
   - Prisma defines `GlimpsState` enum in schema, while service keeps separate JS sets (`GLIMPS_STATES`, privacy, tone).
   - Frontend also has its own state values. This introduces future mismatch risk.

3. **Route/contract growth is outpacing conformance coverage**
   - Run 5 added conformance tests for envelope taxonomy, but Run 6 Glimps paths have little backend behavioral verification.

---

## 4) Persistence concerns

1. **DB fields are mostly appropriate, but taxonomy is inconsistent**
   - Core fields (`reflection`, `mood`, `privacy`, `emotionalTone`, `state`, timestamps, `archivedAt`) are sensible.
   - `privacy` and `emotionalTone` are plain strings in DB while `state` is enum. This mixed strategy may be intentional short-term but needs explicit policy.

2. **Archive semantics are under-specified**
   - `archiveViewerGlimps` unconditionally writes `state: 'archived'` + `archivedAt` and returns updated row.
   - There is no explicit behavior for “already archived,” no idempotency guarantee contract, and no guard against archiving invalid lifecycle states if future states expand.

3. **Potential referential mismatch risk not validated in service**
   - Service assumes `viewer.identity.userId` is internal DB user ID shape; no explicit check or translation boundary is present.

4. **Migration quality is acceptable but minimal**
   - SQL migration creates table/index correctly, but no check constraints for controlled text fields, and no documented backfill/versioning policy for future enum/value evolution.

---

## 5) API concerns

1. **Reason-code consistency is not fully aligned with shared contracts**
   - `validation.invalid_id` is shared and used correctly.
   - `glimps.not_found` is not in shared contracts, so clients cannot rely on centralized reason-code registry.

2. **Envelope format is consistent, but semantics differ by route intent**
   - Routes correctly use `ok(...)` and error normalization pipeline.
   - Still, archive endpoint uses `PATCH` with `requiresJson: false`; this is acceptable because no body is required, but should be explicitly documented to avoid future accidental payload assumptions.

3. **Error mapping mostly works, but domain granularity is thin**
   - “Not found” is mapped to `DOMAIN` error kind; acceptable, but domain-specific reason constants should be shared and typed.

---

## 6) Auth/permission concerns

1. **Anonymous writes are blocked (good)**
   - Both route-level and service-level checks reject unauthenticated calls.

2. **Viewer-safe metadata remains minimal (good)**
   - Route responses include `viewerMeta(req.viewer)` and do not leak auth internals.

3. **Ownership enforcement is safe in queries but no explicit audit/log boundary**
   - Current enforcement depends on where clauses; no additional policy abstraction for traceability yet.

---

## 7) Frontend integration concerns

1. **Mock/backend state mismatch is the biggest integration risk**
   - Frontend create flow submits `state: 'shared'`.
   - Backend only accepts `draft|published|expired|archived` and will reject `shared` as invalid payload.
   - Mock transport currently stores created items with `state: 'shared'`, masking the backend mismatch during local/mock testing.

2. **Service boundary is present, but transport operation mapping is still mock-era**
   - Web service calls operation names (`glimps.create`, `glimps.viewer.list`) through API client; real HTTP adapter parity is still deferred.

3. **UX error handling is solid, but success path depends on contract parity**
   - The UI has good fallback states; however, the invalid state mismatch can force repeated validation failures once backend wiring is active.

---

## 8) Contract consistency concerns

1. **Internal field redaction is handled correctly in current paths**
   - Backend DTO mapper and frontend mapper both suppress unknown/internal fields.

2. **Shared contracts are reused for core envelope taxonomy, but Glimps domain constants are missing**
   - No shared constants for Glimps states/privacy/tone or Glimps-specific reason codes.
   - This creates parallel enums across backend service, frontend domain modules, and mock transport.

3. **ID strategy is partially standardized**
   - `usr_` prefix comes from shared strategy constants.
   - `glp_` prefix is hardcoded in backend service (not centralized in shared strategy), which weakens portability.

---

## 9) Mobile readiness

Current readiness: **6.5/10**.

What helps:
- Explicit API/service layering on web.
- DTO mapping boundaries on backend and web.
- Shared envelope/error taxonomy foundation.

What blocks stronger readiness:
- No shared Glimps contract constants (state/reason code drift risk across platforms).
- Mock/backend mismatch (`shared` vs backend enum states) would force mobile-specific workaround logic.
- Thin backend tests for auth/ownership/error semantics on Glimps routes.

---

## 10) Suggested stabilization plan

### Phase A — Contract/source-of-truth alignment (P0)
1. Add shared Glimps contract constants in `packages/shared/src/contracts.js`:
   - states,
   - privacy values,
   - emotional tones,
   - reason codes (e.g., not found, invalid state transition).
2. Replace backend/frontend/mock hardcoded Glimps literals with shared constants.
3. Resolve `shared` vs `published|draft` semantics before enabling real backend transport in UI flow.

### Phase B — Persistence and lifecycle hardening (P0/P1)
1. Define archive semantics explicitly:
   - idempotent behavior,
   - allowed source states,
   - archived timestamp policy.
2. Consider DB-level support for controlled vocabularies (enum/check constraints) for privacy/emotionalTone if product values are stable.
3. Add guardrail tests for owner-only access and archive transitions.

### Phase C — API/error consistency (P1)
1. Centralize Glimps reason codes in shared contracts and update backend to use them.
2. Add route/service conformance tests that verify status, kind, reasonCode, retryable, and DTO shape.
3. Document route JSON expectations (`requiresJson`) per endpoint for future maintainers.

### Phase D — Frontend migration quality (P1)
1. Add integration tests for create flow service behavior against backend-compatible state values.
2. Keep mock transport contract-accurate to backend values to prevent hidden regressions.

---

## 11) Prioritized next steps

### P0 (before wiring real backend transport to Glimps create flow)
1. Fix state contract mismatch (`shared` vs backend enum).
2. Add Glimps constants/reason codes to shared contracts and consume them in backend + web + mock.
3. Add backend tests for anonymous rejection, owner-only read/archive, and not-found reason-code behavior.

### P1
1. Define/archive lifecycle transition policy and enforce it in service tests.
2. Decide whether privacy/emotionalTone should remain string fields or move to constrained values at DB level.
3. Add contract conformance tests for Glimps DTO field shape and redaction boundaries.

### P2
1. Introduce pagination/filtering contract for viewer list before dataset growth.
2. Add observability hooks (structured logs/metrics) around create/archive failures and auth denials.
3. Prepare mobile-facing fixture pack for Glimps envelopes/reason-codes once constants are centralized.

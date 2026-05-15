# Run 5 Review — Backend Foundation

## 1) Summary
Run 5 establishes a credible backend starting point: there is now a real API process, shared contract constants, a first Prisma-backed persistence path, and explicit auth/viewer hooks. The direction is broadly correct for incremental delivery.

That said, this foundation is **not yet stabilization-ready** in several high-risk seams:
- backend-only contract constants and web transport error categories are already drifting,
- anonymous fallback persistence behavior creates unsafe identity coupling,
- route/auth/persistence boundaries are conceptually present but still under-enforced,
- and some convenience defaults (JSON gating, placeholder upserts) could become migration debt if left as-is.

Overall: **good progress, medium architecture health, high need for boundary hardening before broader backend rollout**.

---

## 2) What is working well

1. **Backend shell is intentionally minimal and clean**
   - `apps/api/src/app.js` keeps routing, middleware, and error handling centralized without framework lock-in.
   - Route registration is straightforward and easy to extend for v1 domains.

2. **Contract centralization started in the right place**
   - Shared constants in `packages/shared/src/contracts.js` are correctly used by backend envelope/error/auth modules.
   - Web re-exports shared contracts, which is the right long-term contract ownership direction.

3. **First persistence path respects DTO mapping intent**
   - `profile-service` does not return raw Prisma models; `toClientProfile` maps to client-safe output.
   - Completeness is derived server-side and not trusted from client payloads.

4. **Auth foundation is provider-neutral**
   - `auth/viewer.js`, `auth/middleware.js`, and `auth/route-guard.js` keep provider-specific assumptions out of route handlers.
   - Route-outcome + reason-code shape aligns with Run 4 policy vocabulary.

5. **Monorepo split supports web/backend convergence**
   - `packages/shared` plus separate `apps/api` and `apps/web` boundaries are structurally mobile-friendly and scalable.

---

## 3) Main architecture concerns

1. **Boundary intent is stronger than enforcement**
   - Boundaries exist (services, auth middleware, shared contracts), but they are still easy to bypass due to limited guardrails and lightweight route matching.

2. **Global JSON requirement is too blunt at app entry**
   - `assertJsonRequest(req)` is run for all requests before route dispatch. This can force unnecessary content-type coupling for routes that should remain transport-simple (including many GET paths).

3. **Current router model may become fragile as API grows**
   - Array `.find()` route lookup is fine now but offers no path params, per-route middleware composition, or route grouping. This is acceptable temporarily but should be replaced before domain expansion.

4. **Error normalization is simple but not yet domain-governed**
   - `errorHandler` works, but there is no strict mapping layer that guarantees infra/service errors always translate through canonical domain reason codes.

---

## 4) API concerns

1. **Mock → backend migration is plausible, but contract drift has already started**
   - Web mock transport returns `DOMAIN_ERROR_KIND.RETRYABLE`, but shared `DOMAIN_ERROR_KIND` currently has no `RETRYABLE` member. This is a concrete cross-boundary inconsistency and a warning sign for future adapter parity.

2. **Frontend transport envelope and backend HTTP envelope are similar but not unified**
   - Web async-state wrappers and backend HTTP envelopes both exist, but there is no conformance fixture/test ensuring both layers preserve the same reason-code/kind semantics.

3. **Route not found reason-code inconsistency**
   - Shared contracts define `route.unknown_route`, while backend `notFound` returns `route.not_found`. This is minor now but exactly the kind of drift that breaks client error handling at scale.

4. **Service contract bypass risk remains moderate**
   - Profile routes call service methods correctly, but broader domain coverage is still partial; until all features migrate through API clients/services, bypass risk remains.

---

## 5) Auth concerns

1. **Viewer context shape is coherent, but identity source is still placeholder-only**
   - `lookupSession` returning null by default means all calls are effectively anonymous unless custom headers/session logic appears later.

2. **Anonymous fallback user persistence is high-risk**
   - `getViewerUserId` falls back to a constant `placeholder-viewer-user`, then upserts a real `users` row. This creates shared pseudo-identity state across anonymous traffic and can pollute profile data.

3. **Route protection semantics are under-used in current routes**
   - All declared routes currently set `requiresAuth: false`. That is fine for scaffolding, but without at least one authenticated-only path soon, guard behavior remains unproven.

4. **Auth-safe metadata is a good start**
   - Viewer metadata exposure appears intentionally minimal, which helps prevent provider/session leakage to clients.

---

## 6) Persistence concerns

1. **Prisma footprint is reasonable and minimal**
   - User/profile/session schema is appropriately scoped for foundation-only run.

2. **ID strategy mismatch with prior contract direction**
   - Schema uses `cuid()` while prior conventions emphasized prefixed opaque IDs (`usr_`, `prf_`, etc.). This may be acceptable, but if API contracts assume prefixes, conversion/mapping policy must be explicit now.

3. **Profile visibility and ageRange are stringly-typed**
   - Using plain strings for controlled vocab fields is expedient, but increases data drift risk unless validated centrally.

4. **Migration SQL is currently placeholder-level**
   - Foundation migration is acceptable for this run, but versioning discipline (enum evolution, nullability tightening) should be documented before additional tables are added.

5. **DB client lifecycle not yet hardened**
   - Singleton Prisma client is fine for dev; production readiness will need graceful shutdown and connection lifecycle hooks.

---

## 7) Contract consistency concerns

1. **Reason-code drift present today**
   - `route.not_found` vs `route.unknown_route` inconsistency should be fixed immediately.

2. **Error-kind taxonomy is inconsistent across layers**
   - Web mock transport references a retryable kind outside shared enum surface. Either add a canonical retryable kind or model retryability as a flag only.

3. **DTO mapping discipline is good in profile path, but not yet systematically tested**
   - The mapper pattern is right; however, there are no explicit contract fixtures/tests proving every route shape matches shared contracts.

4. **Shared contract authority is correct but incomplete**
   - `packages/shared/src/contracts.js` is being used correctly, yet several route/domain-specific constants still appear locally (string literals), increasing drift probability.

---

## 8) Mobile readiness

Mobile portability is **directionally good**, not yet robust.

What supports mobile reuse:
- Shared contract package exists and is consumed by both web and backend.
- Service/transport boundaries are explicit in web app architecture.
- Backend envelopes and reason-code patterns are straightforward for native-client adapters.

What still blocks strong portability confidence:
- Existing contract drift (reason codes, error-kind taxonomy) implies mobile would need workaround mappings.
- No shared cross-platform conformance suite (fixtures executed for web client + backend responses).
- Anonymous fallback persistence model is unsuitable for mobile session semantics.

Current mobile readiness score: **7/10**.

---

## 9) Overengineering risks

1. **Low immediate risk of framework overengineering**
   - Node `http` + minimal middleware is intentionally lean.

2. **Moderate risk of premature abstraction without enforcement**
   - Multiple boundaries (contracts, auth hooks, services, transport adapters) exist, but without strict tests/lint rules they can become ceremonial layers.

3. **Potential early complexity in policy model before auth is real**
   - Route outcomes/reason codes are useful, but avoid expanding policy matrices until authenticated flows and real restrictions exist.

4. **Do not expand schema breadth yet**
   - Resist adding many domain tables before contract/test and auth identity hardening are in place.

What should wait:
- Advanced role systems.
- Complex provider mapping tables.
- Full-blown route framework replacement unless required by immediate endpoint growth.

---

## 10) Suggested stabilization plan

### Phase A — Contract hygiene (immediate)
1. Normalize reason codes (`route.not_found` vs shared registry).
2. Resolve error-kind taxonomy mismatch (`retryable` handling).
3. Add shared contract conformance fixtures for:
   - backend HTTP envelopes,
   - web transport envelopes,
   - profile DTOs.

### Phase B — Identity/persistence safety
1. Remove constant anonymous user row pattern; use explicit transient anonymous mode.
2. Require authenticated viewer for persistence mutations unless explicitly in seed/dev mode.
3. Add guardrails to prevent unintended writes from anonymous contexts.

### Phase C — API boundary hardening
1. Move JSON-content enforcement to route-level or method-aware policy.
2. Add structured route registry with optional per-route middleware config.
3. Add consistent service-error → API-error mapping helpers.

### Phase D — Growth readiness
1. Introduce repository layer only when second persisted domain lands.
2. Add migration policy doc (enum/value evolution, nullability, backfills).
3. Add backend/web/mobile shared fixtures in CI before adding next major domain endpoints.

---

## 11) Prioritized next steps

### P0 (before adding more persisted domains)
1. Fix contract drifts (`route.not_found`, retryable error-kind inconsistency).
2. Remove or quarantine anonymous fallback upsert behavior.
3. Add automated contract conformance tests for profile endpoints.

### P1
1. Make auth guard behavior observable with at least one authenticated-only endpoint.
2. Tighten payload validation semantics (field enums, normalized limits, reason-code specificity).
3. Refine JSON gate behavior to avoid transport over-coupling.

### P2
1. Clarify ID-format strategy between Prisma IDs and API-facing prefixed IDs.
2. Introduce route grouping/version-aware registry before endpoint count scales.
3. Add DB lifecycle hooks and graceful shutdown handling.

### P3
1. Expand persistence to next domain only after P0/P1 are complete.
2. Add mobile-facing contract fixture pack to ensure platform parity from the start.

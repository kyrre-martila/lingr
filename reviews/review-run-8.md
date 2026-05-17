# Run 8 Review — Native Auth and Authenticated User Flow

## 1. Summary
Run 8 makes meaningful progress on Lingr-native auth and route gating, especially on shared reason-code alignment and explicit session-state progression. Registration/login/logout boundaries exist and authenticated HTTP transport now attaches bearer tokens. Conversation/message routes enforce authenticated viewer membership checks. 

However, this is **not yet fully production-safe for Run 9**. There are still blocking consistency and safety gaps around route protection semantics, profile endpoint auth posture, mock-fallback guardrails, and session persistence assumptions.

**Verdict:** Proceed only after P0 fixes below.

---

## 2. What is working well

- **Auth API boundary exists and is coherent:** `auth.register`, `auth.login`, and `auth.logout` are mapped in web HTTP transport and implemented server-side with envelope responses. 
- **Session token propagation is implemented in client transport:** bearer token auto-attachment is present for HTTP calls via `getSessionToken`.
- **Expired session canonical code path exists:** middleware marks expired sessions and route guard maps this to `auth.session_expired`.
- **Session progression logic is explicit on web state:** `anonymous -> onboarding -> incomplete-profile -> signed-in` is centralized.
- **Route gating reason codes are aligned to shared contracts in web guard:** includes `auth.requires_auth`, `route.requires_onboarding`, `route.requires_profile_completion`.
- **Conversation/message service access is viewer-scoped:** conversation/message list/send require participant membership and reject non-member access.
- **Internal IDs are redacted to external prefixed IDs in conversation/message DTO mapping** (e.g., `cnv_`, `msg_`, `usr_`).
- **MVP scope remains simple:** no Apple/Google/passwordless implementation was introduced into Run 8 auth paths.

---

## 3. Blocking issues before Run 9

1. **Route guard returns auth errors as 403 regardless of auth state.**
   - `toRouteGuardError` always sets `statusCode: 403`, including `auth.requires_auth` and `auth.session_expired`.
   - This weakens canonical client handling and HTTP semantics for auth invalidity (should be 401).

2. **Profile read/completeness endpoints are not protected at route level.**
   - `GET /v1/profile/viewer` and `GET /v1/profile/completeness` are configured with `requiresAuth: false`.
   - Even if services may reject anonymous in some cases, route policy itself is inconsistent with “authenticated user flow” expectations.

3. **Mock fallback can still be toggled globally and may hide failures in non-local scenarios if misconfigured.**
   - Guard is explicit (`__LINGR_DEV_MOCK_FALLBACK__`), which is good, but still runtime-global and not environment-hardened.
   - No explicit production/staging disallow gate present.

4. **Session persistence model is localStorage token-only and lacks stronger session lifecycle controls.**
   - Adequate for MVP spike, but still fragile for token theft and multi-tab/session invalidation coherence.

---

## 4. Auth concerns

- **Registration/login flows** cross backend/API boundary successfully and return `userId + sessionToken + lifecycleState`.
- **Logout** removes server token from in-memory store when bearer provided.
- **Password handling:** server stores SHA-256 hash in in-memory map and does not expose password/passwordHash in API responses.
- **Concern:** login invalid credentials reason code uses `auth.requires_auth`; a more specific invalid-credentials code could improve client UX/analytics without broadening MVP.
- **Concern:** auth route guard status handling (403) for auth failures should be corrected to canonical 401 behavior.

---

## 5. Session/transport concerns

- **Good:** HTTP transport operation map includes auth/profile/conversation endpoints.
- **Good:** bearer token is attached when available.
- **Good:** expired session envelopes pass through with canonical reason code.
- **Concern:** transport fallback behavior only special-cases conversation operations; auth/profile/glimps/sparks do not fallback (desired), but this asymmetry needs explicit product intent documentation.
- **Concern:** localStorage token retrieval and persistence is simplistic and susceptible to stale-token edge cases.

---

## 6. Route gating concerns

- **Good:** enforced web route guard blocks unauthenticated app routes and redirects to onboarding entry.
- **Good:** incomplete onboarding and incomplete profile pathing are handled with canonical reason codes.
- **Concern:** onboarding-blocked redirect target points to `/discovery` while reason indicates onboarding required; this may create UX ambiguity unless discovery hosts onboarding gate shell intentionally.
- **Concern:** API-side route protection `allowOnboarding` is permissive across many authenticated endpoints; if onboarding gating is meant to restrict backend actions, policy needs tightening.

---

## 7. Onboarding/profile concerns

- Onboarding UI remains calm and low-pressure and does not introduce prohibited urgency mechanics.
- Onboarding completion still appears local-state oriented (“save in future release” text), so full backend-persisted onboarding/profile readiness remains partially deferred.
- Profile-completion gating logic is present in session flags and route guard behavior, but backend-readiness parity needs further hardening.

---

## 8. API/contract concerns

- **Good:** shared contracts define canonical reason codes used by guard and transport checks.
- **Good:** conversation/message DTOs use external ID prefix strategy and client-safe envelope metadata.
- **Concern:** `toRouteGuardError` infers kind from `reasonCode` prefix, but status code handling is too coarse.
- **Concern:** auth/login invalid credentials reason-code granularity may be too broad for consistent downstream handling.

---

## 9. Security concerns

- No password field leakage in auth responses.
- Internal DB identifiers are not surfaced in conversation/message DTOs.
- Viewer metadata in envelopes appears limited to auth/lifecycle state.
- **Blocking security concern:** bearer token persisted in localStorage; acceptable for prototype but should be tracked as explicit risk for post-MVP hardening.

---

## 10. Mobile readiness

- Architecture choices (HTTP transport + session token retrieval + centralized route guard state) are directionally mobile-portable.
- Missing for mobile readiness confidence:
  - explicit token refresh/rotation model,
  - consistent auth-status HTTP semantics (401 vs 403),
  - strict fallback policy guarantees.

---

## 11. Suggested stabilization plan

### P0 (must fix before Run 9)
1. Make route-guard auth denials return canonical **401** for `auth.requires_auth` and `auth.session_expired`.
2. Set profile read/completeness routes to `requiresAuth: true` unless intentionally public (document exception if so).
3. Harden mock fallback so it is impossible in prod/staging-like builds (compile-time or env-tier guard).
4. Add integration tests verifying end-to-end register -> login -> authenticated conversation send -> logout -> access denied.

### P1 (near-term)
1. Introduce clearer reason code for invalid login credentials while preserving existing auth taxonomy.
2. Tighten onboarding enforcement policy for write operations if onboarding gate should constrain backend behaviors.
3. Add explicit telemetry when mock fallback activates.

### P2 (after Run 9 start)
1. Improve session persistence strategy (token rotation/expiry-aware client behavior).
2. Multi-tab logout/session invalidation synchronization.

---

## 12. Prioritized next steps

1. **Fix API auth status semantics (401 for auth failures).**
2. **Protect profile viewer/completeness routes with auth requirement.**
3. **Lock mock fallback to dev-only immutable guard.**
4. **Add full auth + conversation integration coverage including expired-session and logout post-conditions.**
5. **Document onboarding/profile readiness source-of-truth between backend and web session flags.**

---

## Verification against requested checklist

### 1) Auth
- Registration through API boundary: **Yes**.
- Login creates usable session: **Yes** (token issuance + bearer attachment path).
- Logout clears session: **Mostly yes** (server invalidation present).
- Expired sessions canonical reason code: **Yes** (`auth.session_expired`), with status-code caveat.
- No Apple/Google/passwordless scope creep: **Yes**.

### 2) Route gating
- Unauthenticated users blocked from app routes: **Yes** (web guard enforced mode).
- Incomplete onboarding routing: **Yes**, with redirect-target UX caveat.
- Incomplete profile routing: **Yes**.
- Completed users app access: **Yes**.

### 3) Transport
- Auth propagated to conversations/messages/profile/Glimps/Sparks: **Partially yes** (bearer available transport-wide; endpoint policy inconsistency remains).
- Authenticated send message e2e: **Directionally yes** via route+service constraints.
- Mock fallback not masking non-dev flows: **Improved but not fully hardened**.

### 4) Data safety
- Internal user/session fields exposed: **No major leakage observed** in reviewed paths.
- DTO/redaction boundaries preserved: **Yes** for conversation/message DTOs.
- Password handling leaked to responses: **No**.

### 5) UX
- Calm/simple auth/onboarding/profile flow: **Mostly yes**.
- Pressure mechanics introduced: **No**.
- Calm-chat rules intact: **Yes** in reviewed scope.

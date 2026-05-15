# Run 4 API Architecture — Backend-Ready Service Layer (Mock Transport)

## 1) API architecture overview

This run introduces a **platform-neutral API architecture layer** for Lingr that preserves current frontend behavior while preparing a low-friction migration path from local mocks to a real backend.

The architecture is intentionally split into separable layers so UI and domain modules do not depend on HTTP, RPC, or any specific transport implementation:

1. **Domain contracts layer**
   - Owns request/response contracts, error conventions, and envelope semantics.
   - Aligns with existing Run 4 domain contract groundwork.
2. **Service boundary layer**
   - Defines domain-oriented client/service interfaces (`auth`, `profile`, `glimps`, `discovery`, `spark`, `window`, `conversations`, `compatibility`, `safety`).
   - UI consumes these interfaces, not transport clients directly.
3. **Transport abstraction layer**
   - Provides a placeholder transport adapter API with no real HTTP calls.
   - Current adapter is an in-memory/local mock executor.
4. **Implementation layer**
   - Current: local/mock clients per domain.
   - Future: REST/RPC/BFF-backed clients implementing the same interfaces.

### Proposed conceptual module layout

```txt
apps/web/src/api/
  contracts/
    envelope.js
    errors.js
    status.js
  transport/
    api-transport.js           // interface only
    mock-transport.js          // local placeholder implementation
  clients/
    auth-client.js
    profile-client.js
    glimps-client.js
    discovery-client.js
    spark-client.js
    window-client.js
    conversations-client.js
    compatibility-client.js
    safety-client.js
  services/
    auth-service.js
    profile-service.js
    glimps-service.js
    discovery-service.js
    spark-service.js
    window-service.js
    conversations-service.js
    compatibility-service.js
    safety-service.js
  index.js
```

This layout is guidance for implementation sequencing; it does **not** require immediate full rewiring of existing modules in this run.

---

## 2) Service boundaries

Service boundaries are domain-first and intentionally mirror Lingr’s product language.

## 2.1 Auth service boundary
- Purpose: session bootstrap, viewer identity context, and permission snapshot surface.
- Current implementation: local placeholder session state.
- Future integration: auth provider token/session mapping.
- Excludes: provider SDK wiring in this run.

## 2.2 Profile service boundary
- Purpose: read/update viewer profile and profile completeness status.
- Returns client-safe profile DTOs only.
- Excludes: persistence logic.

## 2.3 Glimps service boundary
- Purpose: create/read/list Glimps, including moderation state surfaced as client-safe fields.
- Coordinates with safety as read-only association (no direct moderation engine in client).

## 2.4 Discovery service boundary
- Purpose: intro queue, daily pacing limits, and discovery card feed contracts.
- Must expose standardized pagination/list envelope shape (even if mocked).

## 2.5 Spark service boundary
- Purpose: spark invite lifecycle contracts and readiness state presentation.
- Exposes recipient/sender action affordances via booleans.

## 2.6 Window service boundary
- Purpose: conversation pacing window state and reply eligibility.
- Encapsulates rhythm/pause contract outputs consumed by conversations UI.

## 2.7 Conversations service boundary
- Purpose: conversation list/detail/messages and send actions under contract envelopes.
- Delegates pacing/safety/compatibility derivations to downstream domain services/adapters.

## 2.8 Compatibility service boundary
- Purpose: non-gamified emotional compatibility snapshots and reflective hint contracts.
- Exposes descriptors, never score-gamification fields.

## 2.9 Safety service boundary
- Purpose: client-safe safety state and recommendation contracts across channels.
- Exposes recommendation severity/state without leaking internal reason internals.

---

## 3) Error conventions

Define one canonical error envelope used across all domain clients/services.

## 3.1 Success envelope

```ts
ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string; // ISO 8601 UTC
  };
}
```

## 3.2 Failure envelope

```ts
ApiFailure = {
  ok: false;
  error: {
    code: string;                 // stable machine code
    message: string;              // user-safe summary
    category:
      | "validation"
      | "domain"
      | "auth"
      | "permission"
      | "safety"
      | "retryable"
      | "unknown";
    retryable: boolean;
    requestId?: string;
    fieldErrors?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    details?: Record<string, unknown>; // client-safe only
  };
}
```

## 3.3 Loading/success/error response contract for UI consumers

```ts
AsyncState<T> =
  | { status: "idle" }
  | { status: "loading"; previousData?: T }
  | { status: "success"; data: T }
  | { status: "error"; error: ApiFailure["error"]; previousData?: T }
```

This allows all current and future UI surfaces to render consistent loading/error/success states without transport coupling.

## 3.4 Required error categories
- **Validation errors**: malformed request shape or field constraints; include `fieldErrors`.
- **Domain errors**: valid request but business rule failed (e.g., pacing limit reached).
- **Permission/auth errors**:
  - `auth`: missing/expired identity context
  - `permission`: authenticated but action not allowed
- **Safety/moderation errors**: action blocked/restricted due to policy state.
- **Retryable failures**: transient transport/service unavailability and safe-to-retry operations.

---

## 4) Transport assumptions

Current transport is placeholder-only, and UI must not depend on concrete protocol semantics.

## 4.1 Transport interface expectations
- Request contract input + context metadata in.
- Standard envelope (`ApiSuccess` / `ApiFailure`) out.
- No direct DOM/UI concerns.
- No hardcoded `fetch` usage in calling components.

## 4.2 Neutrality goals
The transport boundary must support drop-in adapters for:
- REST (HTTP JSON)
- RPC (single endpoint/method contract)
- BFF (web-specific composition layer)

## 4.3 What remains out of scope
- No real network requests.
- No websocket/realtime channel.
- No caching/invalidation systems.
- No retry backoff implementation (only retryable error shape contract).

---

## 5) Mock → real backend migration strategy

## Phase 1 (now): Contract-first mock alignment
- Keep current local/mock behavior.
- Standardize all domain outputs through API envelopes and async state contracts.
- Add adapters around existing domain modules rather than rewriting UI components.

## Phase 2: Transport swappability hardening
- Ensure each domain service depends on injected transport and not static imports tied to local data.
- Add contract tests for success/error envelopes and edge categories.

## Phase 3: Backend adapter introduction
- Implement one backend transport adapter (REST, RPC, or BFF) behind same interface.
- Move one domain at a time from mock client to backend client.
- Preserve UI and service method signatures to avoid cross-app rewrites.

## Phase 4: Progressive rollout
- Feature-flag client selection (mock vs backend) per domain.
- Keep fallback mock adapter for local development and resilience testing.

Migration principle: **change implementations, not contracts**.

---

## 6) Future auth integration strategy

Auth is prepared as a service boundary, not a provider coupling.

1. Introduce a future `AuthContext` contract used by all domain service calls.
2. Keep identity derivation in auth service/transport middleware layer.
3. Surface only client-safe permission booleans and explicit auth/permission error categories.
4. Avoid spreading provider-specific token/parsing logic into domain services.
5. Preserve existing session-state UX while replacing local auth mock internals later.

This strategy keeps domain clients reusable across web/mobile and compatible with multiple auth providers.

---

## 7) Future mobile reuse considerations

To support mobile clients with minimal rewrite:

- Keep API/service contracts **UI-framework agnostic**.
- Avoid web-only transport assumptions (`window`, `history`, browser-only fetch wrappers) in domain clients.
- Use shared request/response/error envelopes that can be imported by web and mobile apps.
- Keep formatting of relative time and UI labels on client presentation layer, not transport DTOs.
- Keep safety and permission states explicit and normalized for consistent cross-platform rendering.

If mobile is added later, it should consume the same service interfaces and contract package with platform-specific transport adapter injection.

---

## 8) Deferred concerns

Intentionally deferred to later runs:

- Real endpoint definitions and URL structures.
- Authentication provider selection and token lifecycle handling.
- Backend authorization policy engine implementation.
- Request deduping/caching/offline strategy.
- Realtime sync and message streaming protocols.
- Observability concerns (trace propagation, metrics conventions).
- Backward-compatibility/versioning policy finalization across external clients.

These are deferred to keep Run 4 focused on architecture groundwork and contract stability only.

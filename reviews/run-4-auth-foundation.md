# Run 4 Auth Foundation — Identity + Session Groundwork (No Real Auth Yet)

## 1) Auth/session architecture overview

This run defines a backend-ready, platform-neutral foundation for identity and session modeling while preserving current prototype behavior.

### Goals
- Prepare Lingr for real authentication and account lifecycle handling.
- Keep UI decoupled from provider-specific auth concerns.
- Avoid introducing real login/token/cookie/provider/database logic in this phase.

### Proposed layered ownership
1. **Auth domain (identity source + claims shape)**
   - Owns identity primitives and authentication context state.
   - Determines whether viewer is anonymous or authenticated.
   - Produces normalized auth claims (provider-neutral).

2. **Session domain (runtime viewer state)**
   - Owns current viewer session state for app consumption.
   - Combines auth context with account/profile onboarding state.
   - Exposes client-safe session snapshot for route guards and UI gating.

3. **Profile domain (user-managed profile data + completeness)**
   - Owns profile fields and completeness calculation input.
   - Does not own authentication decisions.

4. **Route access domain (policy interpretation)**
   - Owns route access evaluation from session snapshot + policy rules.
   - Returns allow/deny/defer + redirect hint outcomes.

5. **Safety domain (restriction overlays)**
   - Owns restriction flags and enforcement recommendations.
   - Can constrain route/action eligibility regardless of auth status.

### Contract-first architecture principles
- **Provider-neutral identity contract first, provider adapters later.**
- **Session is a composed domain object, not a direct provider payload.**
- **UI reads derived booleans and states, not raw claims internals.**
- **Route policy consumes normalized session contract, not feature-local heuristics.**
- **Safety overlays are explicit and orthogonal to auth provider integration.**

---

## 2) User/account state model

### Core normalized states
Define two separate axes to avoid enum explosion:

1. **Authentication state**
   - `anonymous_visitor`
   - `authenticated_user`

2. **Account lifecycle state**
   - `onboarding_user`
   - `incomplete_profile`
   - `active_member`
   - `paused_account`
   - `safety_restricted_account`

A composed session may be represented as:
- anonymous + onboarding-eligible
- authenticated + incomplete_profile
- authenticated + active_member
- authenticated + paused_account
- authenticated + safety_restricted_account

### Proposed platform-neutral contract sketch
```ts
IdentityContext {
  identityType: "anonymous" | "authenticated";
  userId?: "usr_*";
  subjectRef?: string; // reserved for future auth subject linkage
  providerHints?: string[]; // optional, non-authoritative, provider-neutral hints
}

AccountState {
  lifecycle:
    | "onboarding_user"
    | "incomplete_profile"
    | "active_member"
    | "paused_account"
    | "safety_restricted_account";
  profileCompleteness: "unknown" | "partial" | "complete";
  visibility: "discoverable" | "limited" | "hidden";
  restrictionLevel: "none" | "soft" | "hard";
}

ViewerSession {
  sessionState: "anonymous" | "authenticated";
  identity: IdentityContext;
  account: AccountState;
  permissions: PermissionSnapshot;
  claims: AuthClaimsSnapshot;
  safety: SafetyRestrictionSnapshot;
  updatedAt: ISODateTime;
}
```

### Why this split matters
- Supports current prototype session behavior without committing to provider semantics.
- Enables future backend to own true lifecycle transitions independently from UI.
- Avoids coupling onboarding/profile completeness to auth provider callbacks.

---

## 3) Permission assumptions

### Permission model assumptions
- Permissions are **derived policy outputs**, not UI hardcoded booleans.
- Permissions should be computed from:
  - authentication state
  - account lifecycle state
  - safety restriction state
  - route/action policy

### Proposed permission contract
```ts
PermissionSnapshot {
  canAccessDiscovery: boolean;
  canSendIntro: boolean;
  canOpenConversations: boolean;
  canReplyInActiveWindow: boolean;
  canEditProfile: boolean;
  canPublishGlimps: boolean;
  canPauseAccount: boolean;
  canResumeAccount: boolean;
}
```

### Assumptions for this groundwork phase
- Prototype remains permissive where currently permissive.
- Permission outputs can be mocked/derived locally now.
- Later backend enforcement should preserve contract keys while replacing computation ownership.

---

## 4) Route access assumptions

### Route access policy expectations
- Route access must consume only normalized session/account/safety contracts.
- Route decisions should return structured outcomes:
  - `allow`
  - `soft_block` (allowed with advisory)
  - `hard_block` (redirect required)

### Proposed policy response shape
```ts
RouteAccessDecision {
  routeId: string;
  outcome: "allow" | "soft_block" | "hard_block";
  reasonCode:
    | "requires_auth"
    | "requires_onboarding"
    | "requires_profile_completion"
    | "account_paused"
    | "safety_restricted"
    | "policy_limited";
  redirectTo?: string;
  userFacingHint?: string;
}
```

### Current-run constraints
- Keep present prototype route behavior intact.
- Use this structure as architecture guidance; avoid hard enforcement rewrites in this run.

---

## 5) Safety restriction model

Safety must be modeled as a first-class overlay that can affect identity/session usability without changing auth provider assumptions.

### Safety restriction assumptions
- Safety is not synonymous with auth validity.
- A user can be authenticated yet restricted.
- Restriction can be scoped per action and/or route domain.

### Proposed safety snapshot contract
```ts
SafetyRestrictionSnapshot {
  level: "none" | "observe" | "limited" | "restricted";
  scope: Array<"discovery" | "conversations" | "glimps" | "profile">;
  canAppeal: boolean;
  reviewState: "none" | "pending" | "resolved";
  lastEvaluatedAt?: ISODateTime;
}
```

### Policy interaction assumptions
- `limited` may reduce capabilities (e.g., publishing or replying).
- `restricted` may hard-block specific routes/actions.
- Safety messaging shown to users must remain client-safe and non-sensitive.

---

## 6) Future provider strategy

### Provider-neutral strategy
Support future auth methods through adapters mapped into shared contracts:
- email/password
- passwordless login
- Apple Sign In
- Google Sign In
- future verification systems

### Integration approach (future)
1. Provider SDK/token response enters auth adapter boundary.
2. Adapter maps provider payload into `IdentityContext` + `AuthClaimsSnapshot`.
3. Session composer builds `ViewerSession` with account/profile/safety overlays.
4. UI and route policies consume the normalized session snapshot only.

### Explicitly deferred
- Token issuance/refresh logic
- JWT/cookie/session storage strategy
- Provider SDK wiring
- Backend auth endpoint implementation

---

## 7) Mobile-app considerations

To keep auth/session architecture reusable across web and mobile:
- Keep contracts framework-agnostic and transport-agnostic.
- Avoid browser-only assumptions (`window`, cookie presence, localStorage requirements) in domain contracts.
- Keep route/access decisions platform-neutral so mobile navigation guards can reuse the same policy engine.
- Keep permission and safety snapshots explicit booleans/states rather than UI-specific text.
- Preserve a single identity/session vocabulary across clients to reduce cross-platform drift.

---

## 8) Deferred decisions

The following are intentionally deferred to later implementation runs:
- Canonical `AuthClaimsSnapshot` field list and claim trust model.
- Session persistence medium (cookie vs secure storage vs hybrid).
- Refresh/expiration behavior and re-auth flows.
- Auth/account recovery flows (password reset, email verification, account recovery).
- Account linking/merge policy across providers.
- Verification policy design (ID checks, trust tiers, manual review workflow).
- Exact backend ownership split between auth service and user/account service.
- Final route redirect matrix and guard strictness modes for production.

---

## Terminology normalization adopted in this run

- **Identity**: who the viewer is (anonymous/authenticated).
- **Auth claims**: proof/context assertions from auth boundary (provider-neutral in client contracts).
- **Session**: composed runtime viewer context used by app policies.
- **Account state**: lifecycle + profile completeness + safety overlay outcomes.
- **Permissions**: derived action grants from policy evaluation.
- **Route access**: route-level allow/block decisions derived from session.

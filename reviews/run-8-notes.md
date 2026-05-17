# Run 8 Notes — Authenticated Gating Flow Stabilization

## Onboarding gating decisions
- Kept onboarding as the first post-auth required gate.
- Added centralized session-state resolver logic so auth state + onboarding completion decide whether a user remains in `onboarding` state.
- Route guard now emits canonical shared reason code `route.requires_onboarding` when authenticated users are still onboarding-gated.
- Onboarding completion is treated as a session/profile readiness input rather than scattered per-component checks.

## Profile completion requirements (MVP)
- Defined minimal profile-complete gate for Run 8 as:
  - user is authenticated
  - onboarding is complete
  - profile completion is complete flag (derived session readiness signal)
- Added canonical shared reason code `route.requires_profile_completion` for app-route redirects when profile is incomplete.
- Users in incomplete-profile state are allowed to access `/profile` and routed there from other app routes.

## Route access decisions
- Centralized route gating in `apps/web/src/state/route-access.js`.
- Added reason-code mapping in route guard responses:
  - `auth.requires_auth`
  - `route.requires_onboarding`
  - `route.requires_profile_completion`
  - `route.unknown_route`
- Enforced path guidance:
  - unauthenticated app access → `/onboarding`
  - incomplete onboarding → discovery/onboarding gate handling
  - incomplete profile → `/profile`
  - complete profile → app routes allowed

## Session/profile update behavior
- Added `resolveSessionStateFromFlags` in session state module to derive canonical session state from readiness flags.
- Session state progression is now explicit and testable:
  - anonymous
  - onboarding required
  - profile completion required
  - signed-in ready
- This keeps onboarding/profile completion transitions aligned with route gating in one place.

## Transport/session consistency behavior
- Existing authenticated HTTP transport behavior remains in place (Bearer token auto-attachment after login).
- Existing expired-session envelope handling remains canonical (`auth.session_expired`), with no silent mock fallback in authenticated app flows unless explicit dev mock mode is enabled.

## Tests/checks added
- Expanded `apps/web/test/auth-session-flow.test.js` coverage for:
  - unauthenticated route access block + redirect
  - authenticated incomplete onboarding gating
  - authenticated incomplete profile gating
  - authenticated completed profile access
  - expired session canonical error envelope
  - profile/onboarding completion state progression resolution

## Deferred work
- Persist onboarding completion to backend profile/user record (currently represented as readiness/session state input).
- Introduce dedicated `/auth` and `/profile-completion` route surfaces if product wants separated UX from full profile screen.
- Wire server-provided onboarding/profile completion flags directly into client bootstrap session hydration.
- Password reset and email verification flow hardening (separate Run 8 sub-scope).

## Manual testing checklist
- [ ] Register with email/password and verify session token is created.
- [ ] Login with existing credentials and verify session token is used by subsequent API requests.
- [ ] Visit `/discovery` while unauthenticated and verify redirect guidance to onboarding/auth entry path.
- [ ] Authenticate with onboarding incomplete and verify app-route gating remains onboarding-blocked.
- [ ] Mark onboarding complete with profile incomplete and verify non-profile app routes redirect to `/profile`.
- [ ] Complete profile requirements and verify `/discovery`, `/conversations`, and `/profile` are all accessible.
- [ ] Expire a session token and verify protected operations return `auth.session_expired` and app handles session loss gracefully.
- [ ] Confirm mock fallback only activates when explicit dev mock fallback flag is enabled.

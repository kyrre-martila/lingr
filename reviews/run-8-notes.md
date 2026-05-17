# Run 8 Notes — Lingr-native Authentication MVP

## Auth architecture decisions
- Added first Lingr-native auth endpoints: `POST /v1/auth/register`, `POST /v1/auth/login`, `POST /v1/auth/logout`.
- Kept implementation intentionally simple and backend-ready with in-memory auth/session store boundary (`session-store.js`) that can later be replaced by DB-backed persistence.
- Preserved shared contract usage and canonical reason-code behavior for auth failures.

## Session strategy
- Bearer-token session model with TTL-based expiration.
- Session lookup now returns explicit expired-session signal, converted to viewer auth state `expired`.
- Route guard maps expired viewer to canonical `auth.session_expired` instead of generic anonymous failure.
- Logout invalidates session token explicitly.

## Route gating decisions
- Route guard behavior now supports explicit expired-session reason propagation.
- Enforced onboarding gating remains active through existing route-access layer; onboarding-only routes are blocked for signed-in users in enforced mode.

## Transport/session propagation changes
- HTTP transport now supports:
  - auth operations (`auth.register`, `auth.login`, `auth.logout`)
  - profile snapshot (`profile.get`)
  - existing conversation operations
- HTTP requests now include `Authorization: Bearer <token>` when session token exists.
- Default API client reads persisted session token from `localStorage`.
- Mock fallback behavior tightened: fallback to mock is now explicit dev-only (`__LINGR_DEV_MOCK_FALLBACK__`) for conversation operations; other failures surface without silent fallback.

## Files/modules added
- `apps/api/src/routes/auth.js`
- `apps/web/test/auth-session-flow.test.js`

## Files/modules updated
- `apps/api/src/auth/session-store.js`
- `apps/api/src/auth/middleware.js`
- `apps/api/src/auth/route-guard.js`
- `apps/api/src/routes/index.js`
- `apps/web/src/api/http-transport.js`
- `apps/web/src/api/client.js`

## Deferred auth features (intentional)
- Apple Sign In
- Google Sign In
- passwordless login
- account linking
- advanced role systems
- notifications
- realtime systems

## Local test commands
- `pnpm --filter @lingr/web test`
- `pnpm --filter @lingr/api test`

## Manual testing checklist
- [ ] Register new user with email/password and capture session token.
- [ ] Login with existing email/password and verify session token rotation.
- [ ] Logout and verify protected route access fails with auth reason code.
- [ ] Force-expire session and verify canonical `auth.session_expired`.
- [ ] Access conversation list with active token and verify success.
- [ ] Send text message with active token and verify success envelope.
- [ ] Confirm onboarding route gating behavior in enforced mode.
- [ ] Confirm mock fallback only activates when dev flag is explicitly enabled.

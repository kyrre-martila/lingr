# Run 8 Fixes — Auth/Session and Route Gating Stabilization

## Files changed
- `apps/api/src/auth/route-guard.js`
- `apps/api/src/routes/index.js`
- `apps/api/src/routes/auth.js`
- `apps/web/test/auth-conversation-integration.test.js`
- `apps/web/src/api/client.js`
- `packages/shared/src/contracts.js`
- `reviews/run-8-notes.md`

## Auth status fixes
- Updated route-guard error mapping so auth denials use canonical 401 semantics.
- `auth.requires_auth` now returns 401.
- `auth.session_expired` now returns 401.
- Route/permission denials remain 403.
- Added optional auth reason-code improvement: login invalid credentials now emits `auth.invalid_credentials`.

## Profile route protection changes
- Enforced route-level auth for:
  - `GET /v1/profile/viewer`
  - `GET /v1/profile/completeness`
- Anonymous calls now receive canonical auth error envelope with `auth.requires_auth` and 401.

## Mock fallback hardening
- Fallback remains limited to conversation operations only.
- Fallback activation now requires explicit dev-only toggle (`__LINGR_DEV_MOCK_FALLBACK__ === true`).
- Added production/staging-like guardrails so fallback is disabled in production-like environments.
- Auth failures are surfaced directly and are not masked by fallback behavior.

## Tests added
- Added transport integration coverage test covering:
  - register
  - login
  - authenticated profile viewer/completeness access
  - authenticated conversation list/timeline
  - authenticated send message
  - logout
  - access denied after logout
  - expired session returns canonical 401 + `auth.session_expired`
  - unauthenticated profile access denied

## Onboarding/profile source-of-truth notes
- Documented current MVP source-of-truth boundaries and how session derives readiness from auth + onboarding + profile completeness signals.
- Clarified that fully authoritative backend onboarding milestone persistence/hydration remains deferred hardening work.

## Intentionally deferred issues
- Full backend onboarding milestone persistence model.
- Server-authoritative bootstrap hydration for all readiness flags.
- Advanced session hardening (rotation/revocation synchronization beyond current MVP baseline).

## Manual testing checklist
- [ ] Register and capture returned session token.
- [ ] Login with valid credentials and verify authenticated profile routes succeed.
- [ ] Verify `GET /v1/profile/viewer` fails with 401 when anonymous.
- [ ] Verify `GET /v1/profile/completeness` fails with 401 when anonymous.
- [ ] List conversations and fetch timeline while authenticated.
- [ ] Send a text message while authenticated.
- [ ] Logout and verify protected conversation/profile routes return 401.
- [ ] Force-expire a session and verify protected route returns 401 + `auth.session_expired`.
- [ ] Verify mock fallback only activates in explicit dev mode.

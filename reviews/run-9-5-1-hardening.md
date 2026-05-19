# Run 9.5.1 — Pre-Run-10 Hardening

## Auth transport changes
- Web HTTP transport now sends cookie credentials (`credentials: include`) and no longer reads session token from localStorage.
- API auth routes now set/clear `lingr_session` HttpOnly cookie during register/login/logout.
- API auth middleware resolves session from cookie first, with bearer fallback retained for future non-web clients.

## Cookie/session decisions
- Cookie name: `lingr_session`
- Attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production.
- Session token is not exposed in register/login response payloads.
- Canonical auth semantics preserved:
  - expired session → `auth.session_expired`
  - missing/revoked session → `auth.requires_auth`

## Mock discovery cleanup
- Layer 0 discovery mock introduction payload no longer exposes `displayName` or `locationRegion`.
- No timestamp/activity/urgency metadata is included in Layer 0 discovery mock payload.

## Tests added/updated
- Updated web HTTP/auth tests to validate cookie credentials mode and absence of authorization bearer headers.
- Added mock discovery conformance test ensuring forbidden Layer 0 fields remain absent.
- Existing API discovery conformance test already validates DTO omissions for direct identity and timestamps.

## Mobile deferred notes
- Native/mobile auth strategy is intentionally deferred.
- Future flow may use secure native storage + bearer transport, independent of web cookie transport.

## Remaining risks
- CSRF protections are still minimal at MVP and should be expanded before high-scale production use.
- Cookie path/domain scoping may need tightening once app/API domains are fully split in deployment environments.
- Bearer fallback in middleware should later be constrained to explicit non-browser client channels.

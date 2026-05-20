# Run 11.7 — HMAC Session Security Stabilization

## Architecture decision
- Session-token hashing is upgraded from unkeyed `SHA-256` hashing to keyed `HMAC-SHA256`.
- Hashing now uses `createHmac('sha256', LINGR_SESSION_SECRET)` and still persists into existing `sessions.tokenHash`.
- Existing auth design remains intact:
  - Prisma-backed session persistence
  - HttpOnly cookie web transport
  - Bearer fallback in middleware for future native/mobile channels
  - Existing revoked/expired semantics and logout behavior

## Security reasoning
- Prior deterministic unkeyed hashing exposed avoidable risk if token-hash material were analyzed offline.
- Keyed HMAC binds token hashing to a server-held secret and materially improves resistance to precomputation/replay-style hash analysis.
- Runtime behavior includes:
  - production secret requirement (`LINGR_SESSION_SECRET` required)
  - controlled non-production fallback secret to avoid local breakage
  - timing-safe hash equality checks where comparisons are made
  - no raw token logging and no secret exposure in API payloads

## Migration implications
- Existing sessions created under legacy hashing can no longer be validated after rollout.
- This is an expected compatibility break and is acceptable for security stabilization.
- User impact: some currently signed-in users may be prompted to sign in again.
- No destructive Prisma/database migration is required because field shape (`sessions.tokenHash`) is unchanged.

## Deferred auth complexity
Intentionally not included in Run 11.7:
- JWT migration
- refresh token architecture
- session rotation redesign
- multi-provider auth expansion

This run stays narrowly scoped to token-hash hardening while preserving current MVP auth behavior.

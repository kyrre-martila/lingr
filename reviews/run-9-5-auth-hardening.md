# Run 9.5 — Auth Hardening

## Architecture decisions
- Migrated auth from in-memory maps to Prisma-backed `User` and `Session` records.
- Added bcrypt password hashing (`12` rounds) with dedicated helpers: `hashPassword`, `verifyPassword`.
- Implemented hashed bearer token persistence (`sessions.tokenHash`) and DB-backed session lookup/revocation.
- Adopted 30-day fixed session TTL for MVP.

## Migration notes
- Added safe additive schema changes:
  - `users.email` (unique, non-null)
  - `users.passwordHash` (non-null)
  - `sessions.tokenHash` (unique, non-null)
- Migration backfills existing rows with placeholder values to avoid destructive changes.

## MVP shortcuts intentionally kept
- Single auth provider (`lingr_native`) only.
- Fixed TTL policy (no per-device refresh/session rotation).
- No advanced device/session metadata beyond current session table fields.

## Remaining auth debt
- Introduce session rotation and refresh-token split.
- Add explicit user lifecycle/profile-completion projection materialization.
- Add rate limiting + brute-force mitigation at auth endpoints.

## Risks
- Placeholder backfill emails for legacy rows should be replaced through account recovery/migration tooling.
- Fixed TTL may not meet all threat-model expectations without session rotation.

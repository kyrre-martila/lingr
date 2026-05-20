# Run 11.7 — Prompt 4 E2E smoke test (updated for deterministic runner)

## Smoke command
- `npm run e2e:smoke --workspace @lingr/api`

## Why this replaced prior ad-hoc flow
- Replaces scattered `node -e` / manual `curl` chains with a single deterministic backend smoke command.
- Keeps product checks honest (real DB, real API, no onboarding/discovery bypasses).

## Current result in this Codex environment (2026-05-20 UTC)
- **Fail (infrastructure):** `pg_isready` binary not available in current environment, so Postgres reachability cannot be verified.
- Runner fails fast with clear setup guidance instead of pretending DB availability.

## Next blocker
- Install PostgreSQL tooling (`pg_isready`, `psql`, server/cluster) in the run environment, then rerun smoke command.

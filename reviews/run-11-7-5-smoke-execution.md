# Run 11.7.5 — Smoke execution in Codex

## Environment detected
- Codex session date: 2026-05-20 (UTC).
- `pg_isready` initially missing in this session.
- `apt-get` available for package provisioning.
- PostgreSQL cluster tooling available after provisioning (`pg_ctlcluster`, `psql`, `pg_lsclusters`).
- Local cluster detected as `16/main` on `5432`.

## Provisioning done
- Added automatic tooling detection (`command -v`) for:
  - `pg_isready`
  - `pg_ctlcluster`
  - `psql`
  - privilege runner (`sudo` or `runuser`)
- Added safe auto-provisioning path when `pg_isready` is missing:
  - `apt-get update`
  - `apt-get install -y postgresql-client postgresql`
- Added readiness URL normalization for `pg_isready` by removing URL query params (e.g. `?schema=public`) to avoid false negatives.
- Added deterministic DB bootstrap even when Postgres is already reachable:
  - ensure role `lingr` exists
  - reset/ensure role password to `lingr`
  - ensure database `lingr` exists and is owned by `lingr`

## Smoke output
- Command run:
  - `npm run e2e:smoke --workspace @lingr/api`
- Result:
  - Postgres reachable.
  - Prisma generate/migrate/seed completed.
  - API started successfully.
  - Health check passed.
  - Account A register/login passed.
  - Account B register/login passed.
  - Smoke run complete.

## First real Lingr blocker
- None reached in this run.
- Infra blockers in this Codex session were eliminated and the current deterministic smoke path completed.

## Next recommended fix
- Extend smoke beyond auth to intentionally reach the first product-path assertion (e.g. onboarding/discovery/spark/conversation), while preserving stop-at-first-real-blocker semantics.
- Suggested next step: add one post-login assertion for onboarding/discovery state to convert this from infra/auth smoke into product smoke.

# Run 11.7.4 — E2E smoke runner

## Command to run
- `npm run e2e:smoke --workspace @lingr/api`

## Environment defaults
- `DATABASE_URL` defaults only in dev/smoke contexts to:
  - `postgresql://lingr:lingr@localhost:5432/lingr?schema=public`
- `PORT` defaults to `4000` unless overridden.
- `E2E_API_BASE_URL` defaults to `http://127.0.0.1:4000`.

## What it provisions/starts
1. Confirms `DATABASE_URL` exists (or sets safe local smoke default).
2. Checks Postgres reachability via `pg_isready`.
3. If unreachable and available, attempts:
   - `pg_ctlcluster 16 main start`
   - create `lingr` role if missing
   - create `lingr` database if missing
4. Runs:
   - `prisma generate`
   - `prisma migrate deploy`
   - dev E2E seed (`country=NO`, `region=trondelag`, open)
5. Starts API and checks `/v1/health`.
6. Executes smoke auth steps:
   - register/login Account A
   - register/login Account B

## What it does not do
- No API mocking.
- No DB mocking.
- No fake ID forcing.
- No onboarding/discovery bypass.
- Stops on first real blocker.

## Pass/fail result (this run)
- **Fail:** missing local Postgres tooling (`pg_isready` not found) in this Codex session.

## Next blocker
- Ensure Postgres tooling/cluster exists in the environment, then rerun the smoke command.

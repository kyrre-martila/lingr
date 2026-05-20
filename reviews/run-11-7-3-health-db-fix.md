# Run 11.7.3 — Health DB blocker fix

## Root cause
`checkDatabaseHealth` called `getDbClient()` without `await`, so `client` was a `Promise`, not a `PrismaClient` instance. The health check then attempted `client.$queryRaw`, causing:

- `client.$queryRaw is not a function`

This made `/health` report database down even when DB wiring/migrations were otherwise valid.

## Fix
- Updated `apps/api/src/db/health.js` to await DB client resolution before issuing the query:
  - `const client = dbClient ?? await getDbClient()`
- Kept architecture intact by adding optional dependency injection input (`{ dbClient }`) for compatibility/testing, while defaulting to real `getDbClient()` in app runtime.
- Added test coverage in `apps/api/test/db-health.test.js`:
  - up case: compatible client with `$queryRaw` => `status: up`
  - down case: incompatible client => `status: down` with reason mentioning queryRaw

## Commands run
1. `node --test apps/api/test/db-health.test.js` ✅
2. `npm run db:migrate:deploy --workspace @lingr/api` ❌ (missing `DATABASE_URL`)
3. `DATABASE_URL='postgresql://lingr:lingr@localhost:5432/lingr?schema=public' npm run db:migrate:deploy --workspace @lingr/api` ❌ (Postgres not reachable at localhost:5432 in this environment)

## Health result
- Could not complete live `/health` curl in this container because Postgres is unavailable (`P1001`), so API startup and end-to-end health probe are blocked by environment DB reachability.
- Code-level blocker (`client.$queryRaw is not a function`) is fixed and covered by unit tests.

## Next blocker
- Infrastructure/runtime blocker: provision/reach Postgres at `localhost:5432` (or set valid `DATABASE_URL`) before continuing headless E2E smoke.

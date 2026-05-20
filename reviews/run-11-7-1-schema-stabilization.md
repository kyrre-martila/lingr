# Run 11.7.1 — Schema/Migration Stabilization

## Root cause

`schema.prisma` evolved to include additional optional `Profile` fields, but migrations only added the reveal JSON fields (`revealInterests`, `revealEmotionalValues`).

As a result, a fresh database created via `prisma migrate deploy` did not contain all columns Prisma Client expects from the current schema model, causing runtime failures (for example on `profiles.pronouns`).

## Missing schema elements found

After auditing `schema.prisma` vs checked-in migration SQL history, the drift was in `profiles`:

- `pronouns`
- `ageRange`
- `bio`
- `layersSummary`
- `locationRegion`
- `broadRegion`
- `avatarAssetId`

No additional missing tables/enums/indexes were identified from the migration history audit.

## Migration added

Added additive migration:

- `apps/api/prisma/migrations/0016_run_11_7_1_profile_schema_sync/migration.sql`

This migration uses `ADD COLUMN IF NOT EXISTS` for all missing nullable profile columns to safely align new or partially-migrated databases.

## Run 11.7.2 validation execution (Codex cloud, 2026-05-20 UTC)

### Exact DB startup commands used

1. `apt-get update && apt-get install -y postgresql`
2. `pg_ctlcluster 16 main start && pg_isready`
3. `su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='lingr';\" | grep -q 1 || psql -c \"CREATE USER lingr WITH PASSWORD 'lingr';\""`
4. `su - postgres -c "psql -lqt | cut -d \| -f 1 | grep -qw lingr || createdb -O lingr lingr"`

### Exact DATABASE_URL used

- `postgresql://lingr:lingr@localhost:5432/lingr?schema=public`

### Fresh migration path result

Executed with the DATABASE_URL above:

1. `npm run db:generate --workspace @lingr/api` ✅
2. `npm run db:migrate:deploy --workspace @lingr/api` ✅
3. `npm run db:seed:dev-e2e --workspace @lingr/api` ✅

`db:migrate:deploy` applied all migrations through:
- `0016_run_11_7_1_profile_schema_sync`

### Profile field validation result

Ran a minimal Prisma script against the migrated DB to upsert/read a user + profile and update/read:
- `pronouns`
- `ageRange`
- `bio`
- `layersSummary`
- `locationRegion`
- `broadRegion`
- `avatarAssetId`

Result:
- ✅ Script completed successfully.
- ✅ No missing-column errors.
- Output included `PROFILE_FIELD_CHECK_OK` with all expected field values.

## Next real blocker during continued smoke

Attempting to continue E2E smoke by starting API and checking health revealed a backend DB integration blocker before onboarding/discovery/spark progression:

- Command: `DATABASE_URL='postgresql://lingr:lingr@localhost:5432/lingr?schema=public' npm run start --workspace @lingr/api`
- Health check: `curl -sS http://localhost:4000/health`
- Response contained:
  - `"database":{"ok":false,"status":"down","reason":"client.$queryRaw is not a function"}`

Because DB health is down due to `client.$queryRaw is not a function`, E2E progression was stopped at this first real blocker and did not proceed with invalid IDs.

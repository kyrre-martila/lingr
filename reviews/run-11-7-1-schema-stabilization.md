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

## Fresh DB validation commands

Intended validation sequence from a fresh Postgres database:

1. `npm run db:generate --workspace @lingr/api`
2. `npm run db:migrate:deploy --workspace @lingr/api`
3. `npm run db:seed:dev-e2e --workspace @lingr/api`
4. Run a minimal Prisma script to read/write `Profile` fields including `pronouns` and other newly added fields.

In this Codex environment, Postgres CLI/server tooling is not available, so full end-to-end fresh DB execution could not be completed locally here.

## Remaining blockers

- Fresh-DB runtime validation is blocked by missing local Postgres runtime/tooling in this environment.
- E2E smoke re-run to readiness setup is pending once the above sequence is executed in an environment with Postgres available.

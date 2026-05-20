# Run 11.7.13 — Spark accept Prisma fix

## Root cause
`syncLayerAfterMutualSpark` called `relationshipLayer.upsert` during Spark accept. Prisma model `RelationshipLayer` used camelCase field names without `@map(...)`, but the SQL table columns are snake_case (e.g. `primary_user_id`).

That caused Prisma to generate SQL referencing non-existent columns such as `primaryUserId`, and Spark accept failed with a 500.

## Failing query / failure details
Observed during `PATCH /v1/sparks/:sparkId/accept`:

- `PrismaClientKnownRequestError`
- `Invalid prisma.relationshipLayer.upsert() invocation`
- `The column primaryUserId does not exist in the current database`

## Why Null/String mismatch happened
After adding diagnostics, the smoke runner itself threw a secondary Prisma error while building Spark inbox diagnostics:

- `Invalid prisma.spark.findMany() invocation`
- `Argument in: Invalid value provided. Expected ListStringFieldRefInput, provided (Null, String)`

Cause: diagnostic query built `in: [viewerAId, viewerBId]` even when one ID was `null`.

This was not the original accept-path production failure; it was a tooling/diagnostics crash that masked the primary error while investigating.

## Fix
1. **Schema mapping fix (real accept-path bug):**
   - Added explicit `@map(...)` for `RelationshipLayer` fields to align Prisma model fields with snake_case DB columns.

2. **Error visibility:**
   - Improved API error normalization for Prisma validation/known-request failures (`domain.invalid_query`) with Prisma details in `error.details`.
   - Added structured server-side logging for unhandled errors (request id, method, URL, error name/message/stack).

3. **Smoke diagnostics robustness:**
   - Guarded Spark diagnostics query so `in` lists only include non-null actor IDs.

## Updated pass/fail table
| Step | Before fix | After fix |
|---|---|---|
| B lists incoming Sparks | PASS | **FAIL (new blocker unrelated to accept)** |
| B accepts Spark | FAIL (500 `domain.unexpected`) | Not reached due earlier blocker |
| Prisma relationshipLayer upsert | FAIL (`primaryUserId` missing column) | Fixed in code |
| Smoke diagnostics query | Could fail with `(Null, String)` | Fixed null-safe query construction |

## Next blocker
Smoke currently stops at:

- `FAIL B lists incoming Sparks: spark <id> not found in viewer list`

This is the next real blocker after the accept-path Prisma column-mapping fix.

# Run 11.7 — E2E readiness review

## Blockers fixed

1. **Web transport defaulted to mixed behavior with mock fallback paths**
   - Updated web API client to use HTTP transport by default for development and production-like environments.
   - Mock transport is now explicit opt-in only (`window.__LINGR_DEV_USE_MOCK__ = true`).
   - This removes hidden fallback behavior during real manual verification.

2. **No simple default region seed for registration gating in local E2E**
   - Added `apps/api/scripts/seed-dev-e2e.js`.
   - Adds/updates `NO` (Norway) and open `trondelag` region so registration can proceed during local testing.
   - Added script command: `npm run db:seed:dev-e2e --workspace @lingr/api`.

3. **README lacked a single explicit manual E2E runbook**
   - Added “Local manual testing flow” with env vars, migration/seed/start order, and two-account checklist.

## Remaining risks

1. Web base URL wiring still depends on local runtime setup and must match API port.
2. Manual flow still depends on both users completing enough onboarding/profile data to appear in discovery.
3. Layer 2/3 unlock timing (4h/16h minimum) makes full unlock progression longer than a quick smoke test.

## Known limitations

1. Mock transport still exists for isolated front-end/dev scenarios, but requires explicit enablement.
2. No automated E2E browser test suite is added in this run (intentional scope control).
3. Seed helper only prepares baseline open region defaults; it does not pre-create user accounts.

## Manual test checklist

- [ ] Start PostgreSQL
- [ ] `npm install`
- [ ] `npm run db:generate --workspace @lingr/api`
- [ ] `npm run db:migrate --workspace @lingr/api`
- [ ] `npm run db:seed:dev-e2e --workspace @lingr/api`
- [ ] Start API (`npm run dev:api`)
- [ ] Start web app
- [ ] Register account A (`NO` / `trondelag`)
- [ ] Register account B (`NO` / `trondelag`)
- [ ] Complete onboarding/profile for both
- [ ] Discovery from A -> Spark B
- [ ] Accept Spark on B
- [ ] Open conversation and exchange messages
- [ ] Trigger chat apps (Match Cards, Guess Me, Snuggle, Playing now)
- [ ] Verify session persistence via logout/login and page refresh

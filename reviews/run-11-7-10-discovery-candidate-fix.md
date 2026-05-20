# Run 11.7.10 — Discovery candidate eligibility fix

## Discovery eligibility rules found (`getDailyDiscovery`)

Candidate/user must satisfy all of the following:

1. **Viewer auth + lifecycle gate**
   - Viewer must be authenticated.
   - Viewer lifecycle must be `active` (onboarding users are denied with `discovery.onboarding_required`; non-active users get `discovery.profile_incomplete`).
2. **Viewer daily cap gate**
   - Viewer must have remaining quota from `discovery_daily_trackers` for the UTC day (`DISCOVERY_LIMIT_PER_DAY`).
3. **Viewer region gate**
   - Viewer profile must have `locationRegion`; otherwise discovery returns `discovery.unavailable_region`.
4. **Candidate base query constraints**
   - Candidate is not the viewer (`id != viewerUserId`).
   - Candidate `users.status = active`.
   - Candidate profile `locationRegion` exactly equals viewer `locationRegion`.
5. **Candidate exclusion filters**
   - Exclude blocked users in either direction (`block_relations`).
   - Exclude users with active spark relationship (`SPARK_ACTIVE_STATES`).
   - Exclude users seen by viewer within the Not-now cooldown window (`discovery_views.createdAt` within 14 days).
6. **Ordering and limit**
   - Query takes up to 20 people ordered by oldest `createdAt`, then slices to viewer `remaining`.
7. **Glimps behavior**
   - Discovery includes up to two **published** glimpses for payload display, but current production filtering does **not** require a minimum glimps count for eligibility.

## Why B was excluded

Initial smoke failure reported:
- `state=empty`
- `reasonCode=discovery.no_available_people`

Based on current discovery logic, this means B was excluded at runtime by one of the active filters/pool constraints (same-region active candidate pool + block/spark/viewed exclusions), not by mocked fallback.

To make this observable and actionable, diagnostics were added to the smoke runner (only) so empty discovery now captures eligibility evidence for A vs B directly from persisted DB state.

## Fix made

### 1) Smoke-only diagnostics for empty discovery
Added a DB-backed diagnostic helper in `apps/api/scripts/run-e2e-smoke.js` that, on empty discovery, reports:
- viewer status / region / profile completeness,
- candidate status / region / profile completeness / published glimps count,
- block relation existence,
- active spark existence,
- discovery-view cooldown evidence,
- same-region active candidate count.

This does **not** weaken production discovery filtering.

### 2) E2E setup persisted data hardening
Added a smoke setup step to create one **published** Glimps for account B before discovery. This ensures B has complete persisted discovery-facing content and avoids ambiguity during candidate eligibility debugging in strict environments.

## Re-run result

Command run:
- `npm run e2e:smoke --workspace @lingr/api`

Observed progression:
- Discovery for A now passes.
- Spark creation from A to discovered user proceeds.

## Pass/fail table (latest run)

| Step | Result |
|---|---|
| db migrate | PASS |
| seed region | PASS |
| api health | PASS |
| register/login A+B | PASS |
| profile setup A/B | PASS |
| glimps setup B | PASS |
| profile readiness A/B | PASS |
| discovery A | PASS |
| spark creation | PASS |
| B lists incoming Sparks | **FAIL** (`spark ... not found in viewer list`) |

## Next blocker

After discovery eligibility was addressed and Spark creation succeeded, the next blocker is downstream in Spark list visibility/lookup consistency for B (`GET /v1/sparks/viewer` assertion), not discovery eligibility itself.

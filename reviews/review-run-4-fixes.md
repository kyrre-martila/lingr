# Run 4 Stabilization Fixes

## Files changed
- `apps/web/src/domain/contracts.js`
- `apps/web/src/domain/contract-fixtures.js`
- `apps/web/src/services/discovery-service.js`
- `apps/web/src/services/conversations-service.js`
- `apps/web/src/components/discovery.js`
- `apps/web/src/components/conversations/index.js`
- `reviews/review-run-4-fixes.md`
- `reviews/run-4-notes.md`

## Contracts created
- Expanded executable shared contract module in `apps/web/src/domain/contracts.js` for IDs, timestamps, auth/session states, account lifecycle states, route outcomes, safety severity, moderation states, visibility levels, spark/window/glimps states, API envelope statuses, and domain error kinds.
- Added policy precedence constant and a lightweight `resolvePolicyOutcome` helper.

## Validators added
- `isIsoTimestamp(value)`
- `isIdWithPrefix(value, prefix)`
- `isApiSuccessEnvelope(value)`
- `isApiErrorEnvelope(value)`

## Reason codes added
Canonical `REASON_CODES` registry with buckets:
- auth failures
- route blocks
- safety restrictions
- moderation outcomes
- validation failures
- permission failures

## Fixtures added
Added `apps/web/src/domain/contract-fixtures.js` golden fixtures for:
- user/profile
- session
- glimps
- spark
- conversation window
- conversation
- message
- compatibility snapshot
- safety event
- API success response
- API error response

## Service boundary changes
- Added `discovery-service` and `conversations-service` as service/client boundaries that encapsulate mock snapshot access.
- Updated discovery and conversation UI modules to consume service boundaries instead of direct mock index access.

## Policy precedence decisions
Canonical order codified:
1. auth validity
2. account lifecycle
3. safety overlay
4. feature permissions
5. route outcome

## Redaction boundary notes
- Fixtures and contracts separate client-safe response examples from internal-only/policy fields.
- Future backend work must serialize through client-safe mappers rather than direct entity serialization.

## Issues intentionally deferred
- Some direct mock imports remain in non-critical modules (e.g. profile/onboarding/glimps setup constants) to avoid risky broad rewrites in this stabilization pass.
- No backend transport, DB logic, ORM models, or real auth wiring introduced.

## Manual testing checklist
- [ ] Verify discovery renders unchanged while reading snapshot through discovery service.
- [ ] Verify conversations renders unchanged while reading snapshot through conversations service.
- [ ] Verify `resolvePolicyOutcome` outputs canonical reason codes for blocked states.
- [ ] Verify API envelope validators return expected booleans for fixture success/error examples.
- [ ] Verify no module directly serializes internal entity shapes as client-safe responses.

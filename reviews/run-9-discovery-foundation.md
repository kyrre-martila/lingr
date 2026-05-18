# Run 9 — Discovery Foundation

## Architecture decisions
- Added shared discovery contracts in `packages/shared/src/contracts.js`.
- Added API discovery service boundary in `apps/api/src/services/discovery-service.js`.
- Added discovery route `GET /v1/discovery/daily`.
- Added persistence tables for viewed-intro tracking and daily limits.

## Temporary MVP shortcuts
- Matching logic is intentionally simple: same region + basic exclusions.
- Region availability for discovery currently inferred from profile `locationRegion` presence.
- Discovery card payload is lightweight and glimpse-first.

## Deferred recommendation logic
- No ranking engine.
- No personalization loops.
- No adaptive optimization.
- No swipe card queue generation.

## Contract additions
- `DISCOVERY_LIMIT_PER_DAY`
- `DISCOVERY_STATE`
- `DISCOVERY_REASON_CODES`
- `REASON_CODES.DISCOVERY.*`

## Known limitations
- No dedicated region-open registry yet (currently uses missing-region -> unavailable).
- No moderation-ranking blend yet.
- Dismiss/spark mutation endpoints are not exposed yet (service methods are in place).

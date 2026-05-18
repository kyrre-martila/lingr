# Run 9 — Discovery Spark Flow Review

## Architecture decisions
- Added dedicated discovery mutation routes for calm interaction actions:
  - `POST /v1/discovery/spark`
  - `POST /v1/discovery/not-now`
- Discovery service now applies soft-dismiss cooldown semantics through `discovery_views` timestamps.
- Discovery spark creation reuses Spark domain service while returning a calm duplicate-safe response contract.

## Deferred logic
- No personalized ranking engine in candidate selection.
- No region-open registry integration beyond current region-presence gate.
- No long-lived recommendation memory beyond cooldown + viewed data.

## Known shortcuts
- `already_exists` duplicate spark handling is returned from discovery service only (not globally normalized across all spark entrypoints).
- Not-now cooldown uses created timestamp in view records for MVP simplicity.

## Inconsistencies found
- Previous discovery UI still exposed progress meta that could be interpreted as pacing pressure; removed from rendered content.
- Previous UI action vocabulary (`Pass quietly`) was inconsistent with current product wording and has been replaced.

## Philosophy compliance review
- No swipe mechanics, no like/dislike framing, and no urgency counters were introduced.
- Discovery interaction remains editorial and one-at-a-time.
- Spark confirmation remains subtle and non-gamified.
- Not-now behavior is intentionally non-rejection and reversible after cooldown.

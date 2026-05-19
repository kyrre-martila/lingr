# Run 10.5 — Stabilization Cleanup

## Cleanup decisions
- Added light anti-gaming progression safeguards without introducing scoring systems.
- Replaced text-derived interests/values reveals with structured profile reveal fields.
- Removed brittle broad-region derivation and switched to explicit `broadRegion` modeling.
- Added conformance protection for timestamp-free default discovery/chat rendering.

## Anti-gaming tradeoffs
- We chose lightweight heuristics (reciprocity, minimum content length, pacing, minimum relationship age) to reduce ping-pong gaming.
- We intentionally avoided opaque scoring, quotas, and optimization loops to preserve calm UX.
- Tradeoff: heuristics are coarse and may occasionally undercount legitimate brief but meaningful exchanges.

## Remaining risks
- Structured reveal fields need consistent population discipline in upstream profile editing flows.
- Heuristic thresholds may require small calibration based on real-world conversational styles.

## Intentionally deferred sophistication
- No semantic quality model.
- No per-user adaptive thresholds.
- No message-level explainability or progress instrumentation.

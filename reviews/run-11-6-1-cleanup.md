# Run 11.6.1 cleanup

## Scope
Small stabilization pass for Run 11.6 trust model. No feature expansion.

## Implemented
- Concurrency fix:
  - Trust accumulation uses atomic DB increments.
  - Layer transition update is conditional to prevent duplicate unlock transition side-effects.
  - Duplicate unlock messages are prevented under concurrent signals by allowing only transition winner to emit unlock.
- Elapsed-time semantics:
  - Layer 1 -> 2 eligibility uses elapsed from `layer1UnlockedAt`.
  - Layer 2 -> 3 eligibility uses elapsed from `layer2UnlockedAt`.
- Pacing change:
  - Minimum counted message-turn spacing raised from 20s to 60s.
- Config validation:
  - Runtime ignores unsafe rules (negative points / thresholds / elapsed minutes, invalid layer jumps).
  - Seeding path validates canonical defaults before upsert.

## Intentionally deferred
- No trust/progress UI.
- No analytics dashboards.
- No cooldown tables, daily caps, anomaly detection, diminishing returns, or complex anti-farming subsystems.
- No Run 12 work.

## Remaining risks
- Invalid DB config is safely ignored at runtime, which favors resilience over strict admin-facing validation UX.
- Duplicate unlock protection depends on transition-guarded writes; adding a DB-level uniqueness guard for unlock events could further harden future runs.

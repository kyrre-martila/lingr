# Run 11.6 — Layer trust logic migration (Prompt 3)

## Architecture decisions
- Replaced reciprocal-count threshold progression as unlock source-of-truth with DB-configured `layer_rules` + `trust_signal_rules`.
- `syncLayerAfterMessage` now applies the existing anti-gaming quality checks first (reciprocal sender alternation, minimum quality text length, pacing guard).
- Only valid `quality_message_turn` events can add trust score points, and points are read from `trust_signal_rules` (no hardcoded increments).
- Unlock checks are rule-driven per transition (`fromLayer -> toLayer`) and require both:
  - minimum elapsed relationship age from `layer1UnlockedAt`
  - required trust score threshold

## Migration from hardcoded thresholds
Removed hardcoded unlock threshold constants from layer service path:
- reciprocal message threshold constants
- hardcoded layer elapsed-time constants

Unlock progression now uses DB values:
- `layer_rules.minElapsedMinutes`
- `layer_rules.requiredTrustScore`
- `layer_rules.enabled`

Trust accumulation now uses DB values:
- `trust_signal_rules.points`
- `trust_signal_rules.enabled`

## Transaction safety
- `syncLayerAfterMessage` now runs in a single Prisma transaction callback.
- State read, trust accumulation, unlock decision, relationship update, and system-message insertion are executed in one transactional boundary.
- Duplicate unlock messages are prevented by checking for an existing `layer_unlock` message scoped to `conversationId` + `metadata.layerLevel` before creating a new one.

## Deferred complexity (intentional)
Not included in this prompt:
- Match Cards / Guess Me / Snuggle / Playing Now signal wiring
- trust event ledger model
- cooldown or daily cap mechanisms
- rule caching / admin UI

## Risks
- If multiple concurrent transactions race before lock serialization at DB level, duplicate-prevention depends on transaction isolation and message existence checks; adding a dedicated unique DB constraint on unlock system events could harden this further.
- Trust calibration remains operational and may require tuning of points/thresholds after real usage.

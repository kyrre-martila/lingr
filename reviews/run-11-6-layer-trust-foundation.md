# Run 11.6 — Layer trust foundation (Prompt 2)

## Scope delivered
Implemented additive persistence and configuration foundation only:
- relationship trust score persistence field
- configurable layer transition rules storage
- configurable trust signal rules storage
- canonical trust signal contracts
- idempotent bootstrap defaults

No unlock-engine replacement was done in this prompt.

## Schema decisions
- Extended `relationship_layers` with `trustScore Int @default(0)`.
- Added `layer_rules` model for transition tuning:
  - unique pair (`fromLayer`, `toLayer`)
  - fields: `minElapsedMinutes`, `requiredTrustScore`, `enabled`, timestamps.
- Added `trust_signal_rules` model for signal-point tuning:
  - unique `signalType`
  - fields: `points`, `enabled`, timestamps.

Rationale:
- Enables threshold and signal calibration without redeploying code.
- Keeps progression contracts server-authoritative and internal.

## Seed/bootstrap strategy
Used API boot idempotent upsert bootstrap (`ensureLayerTrustRules`) rather than ad-hoc one-time script.

Default layer rules:
- 1 -> 2: 240 minutes, trust 20
- 2 -> 3: 960 minutes, trust 55

Default trust signal rules:
- `quality_message_turn`: 2
- `match_cards_completed`: 8
- `guess_me_completed`: 6
- `snuggle_shared`: 5
- `playing_now_shared`: 2

Properties:
- safe repeated boots
- preserves manual tuning once records exist (create-only behavior via empty update payload)

## Migration safety
- Migration is strictly additive.
- No existing columns removed.
- No existing unlock behavior replaced.
- No reciprocal-turn fields removed.
- No destructive operations or data rewrite.

This preserves current runtime behavior until Prompt 3 migration of unlock logic.

## Deferred complexity (intentional)
- trust accumulation/event writes
- unlock-engine evaluation using rule tables
- cooldowns/daily caps/anti-farming policies
- admin UI for rules management
- analytics/backtesting on trust calibration

## Risks
- Bootstrap timing risk: if DB unavailable during boot, API fails fast (intentional safety).
- Configuration drift risk: thresholds can be edited directly in DB before admin tooling exists.
- Calibration risk remains until live trust accumulation is wired in Prompt 3.

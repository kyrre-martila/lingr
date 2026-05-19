# Run 10 — Layer UI Integration

## UI integration decisions
- Kept discovery as strict Layer 0 with anonymous identity key usage and subtle curiosity hinting.
- Added calm discovery hint copy (“More can unfold later.”) through i18n keys only.
- Standardized chat `layer_unlock` fallback title to calm system language.
- Preserved CTA behavior in chat unlock row: render link only when route exists; render plain status text otherwise.

## Philosophy constraints upheld
- No lock-heavy vocabulary or reward framing.
- No progress meters, XP, streaks, quotas, countdowns, or pressure prompts.
- No timeline urgency or activity-signal copy added.

## Deferred polish
- Full migration of existing hardcoded conversation shell copy to i18n remains for follow-up.
- Dedicated profile-route layer projection endpoint remains deferred.
- Additional ARIA copy granularity for each hidden profile segment can be expanded later.

## Risks
- Some legacy conversation/profile copy remains non-keyed and should be localized in a broader pass.
- If upstream message payloads send direct string copy instead of keys, chat fallback localization may diverge.
- Future routes must continue to use relationship projection to avoid accidental field leakage.

## Emotional tone decisions (Run 10 Prompt 4)
- Tightened unlock copy to calm, human language with low emotional amplitude.
- Standardized hidden-state hint to “Getting to know someone takes time.” for safety and curiosity.
- Kept unlock moments meaningful but non-celebratory and non-transactional.

## Copy decisions
- Unlock title/subtitle/CTA wording now favors gentle curiosity over progression mechanics.
- Added explicit forbidden-vocabulary tests for gamified and marketplace drift.
- Expanded localization key expectations to include unlock subtitle and CTA fields.

## Anti-gamification guardrails
- Added test assertions to block `level up`, `upgrade`, `unlock rewards`, `xp`, `streak`, and similar drift.
- Reinforced sender-null system-message assertions for layer unlock events.
- Preserved truthful CTA rule: link only when actionable route exists.

## Deferred polish
- Full i18n migration for all legacy conversation shell copy remains deferred to broader localization pass.
- Potential per-layer aria-description nuance for hidden segments can be expanded later.

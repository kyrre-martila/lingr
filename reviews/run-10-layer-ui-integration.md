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

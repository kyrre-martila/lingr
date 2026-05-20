# Run 11.7 — Layer i18n cleanup

## Why localization ownership changed
- Layer unlock copy previously came from backend-authored English text, which made localization brittle and leaked presentation concerns into service logic.
- This run moves unlock phrasing ownership to frontend i18n packs while backend emits stable message descriptors (`messageKey`, `messageParams`).
- Result: backend contracts stay language-agnostic, and locale changes no longer require service copy edits.

## Copy philosophy
- Unlock moments should feel calm, soft, relational, and subtle.
- Keep progression invisible in tone: no reward framing, no achievement language, no urgency.
- Messages should feel like natural unfolding, not milestones.

## Risks
- Unknown or unsupported backend keys could render fallback key text if not included in i18n packs.
- If translation parity is not maintained, locale consistency may drift over time.
- Legacy payloads with direct `title`/`subtitle` values may still appear from older test fixtures and should be phased out carefully.

## Future translation flexibility
- New locales can be added by extending i18n packs without changing backend unlock logic.
- Additional unlock variants can be introduced by adding new message keys while preserving contract stability.
- Interpolation-ready `messageParams` supports calm contextual personalization when needed.

# Run 3 Notes — Emotional Compatibility Architecture (First Pass)

## Emotional Compatibility architecture decisions
- Added a dedicated platform-neutral Emotional Compatibility domain module in `domain/compatibility` with explicit compatibility dimensions and transparent signal states.
- Modeled compatibility as explainable reflective signals (resonant/flexible/different/unknown) rather than scoring, ranking, or percentages.
- Kept all compatibility logic frontend-only and mock-data based.
- Preserved Lingr tone by generating soft, human compatibility language that invites curiosity instead of prediction.
- Designed helper signatures as adapter-ready contracts for future matching inputs (while keeping current behavior deterministic and local).

## Placeholder signals introduced
- `createCompatibilityProfile(...)`
  - Normalizes lightweight compatibility preferences:
    - communication preference
    - emotional pace
    - conversation style
    - values alignment
    - social energy
    - relationship intention
    - emotional safety preference
- `createCompatibilitySignals({ me, other })`
  - Produces transparent per-dimension signals (`resonant`, `flexible`, `different`, `unknown`).
- `createConversationResonancePlaceholder(signals)`
  - Returns conversational resonance hints.
- `createPacingFitPlaceholder(signals)`
  - Returns emotional pacing-fit hints.
- `createEmotionalAlignmentHints(signals)`
  - Returns emotional alignment safety/value hints.
- `createReflectivePromptsFromCompatibility(signals)`
  - Returns reflective prompt suggestions derived from compatibility patterns.

## Files/modules created or updated
- Updated `apps/web/src/domain/compatibility/index.js`
  - Replaced initial minimal input contract with first structured emotional compatibility domain helpers and enums.
- Updated `apps/web/src/domain/index.js`
  - Re-exported Emotional Compatibility domain helpers for cross-feature integration.
- Updated `apps/web/src/data/mocks/conversations.js`
  - Added mocked per-conversation `compatibilityProfile` payloads.
- Updated `apps/web/src/components/conversations/index.js`
  - Integrated compatibility signals/hints/prompts into conversation detail rendering.

## UI integrations made
- Conversation detail now renders compatibility-informed reflective guidance without scores:
  - conversation resonance hint
  - pacing fit hint
  - emotional alignment hint
- Delayed reflection prompt now uses compatibility-derived reflective prompts when available.
- Kept existing conversation UI structure and visual style intact.
- Did not add ranking, percentages, swipe-like dynamics, or winner/loser framing.

## Future API/matching integration notes
- Keep compatibility helpers as stable adapter boundaries:
  - client can continue passing local profiles today
  - backend can supply richer profile/signal inputs later without UI rewrite
- Potential future integration path:
  1. API supplies normalized compatibility attributes per person.
  2. Domain helpers map attributes to explainable signals.
  3. UI renders reflective hints and prompts only (no hidden scoring output).
- If future matching needs confidence handling, expose uncertainty transparently via `unknown` signals rather than opaque scoring.

## Deferred concerns
- No backend/database persistence or matchmaking service integration.
- No authentication/profile verification source for compatibility attributes.
- No policy tuning UI for compatibility input preferences.
- No automated tests added in this pass (manual checks only).
- No cross-route compatibility surface yet (currently integrated in conversations only).

## Manual testing checklist
- [ ] Open `/conversations` and verify the conversation list still renders and selection still works.
- [ ] Select each conversation and confirm compatibility guidance appears as soft text (no percentages/rank labels).
- [ ] Verify compatibility guidance wording remains reflective/human (no winner/loser dynamics).
- [ ] Verify delayed reflection prompt still renders and now uses compatibility-derived prompt text.
- [ ] Verify paused conversation still disables send actions.
- [ ] Verify non-paused/open conversations still allow message input when messaging availability is true.
- [ ] Confirm no backend/auth/network dependency is required for compatibility rendering.

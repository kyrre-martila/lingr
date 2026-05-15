# Run 3 Notes — Window Domain Architecture (First Window Pass)

## Window architecture decisions
- Added a dedicated platform-neutral Window domain module under `domain/window` that models conversation availability as intentional states rather than always-open chat.
- Formalized Window lifecycle states as canonical constants:
  - `unavailable`
  - `opening`
  - `open`
  - `paused`
  - `quiet`
  - `closed`
- Formalized Window pacing rhythms as canonical constants:
  - `gentle`
  - `normal`
  - `reflective`
- Kept Window logic frontend-only, with no backend, database, auth, or realtime dependencies.
- Preserved calm interaction framing: conversation access is based on readiness, pauses, and intentional pacing guidance.

## Files/modules created or updated
- Updated `apps/web/src/domain/window/index.js`
  - Added reusable Window state/rhythm enums and domain helpers.
- Updated `apps/web/src/domain/index.js`
  - Re-exported Window domain APIs for cross-module use.
- Updated `apps/web/src/data/mocks/conversations.js`
  - Added mocked Window metadata per conversation (`windowState`, `windowRhythm`, emotional and participation placeholders).
- Updated `apps/web/src/components/conversations/index.js`
  - Integrated Window domain helpers into conversation detail/list rendering.

## Placeholder logic introduced
- `canWindowOpen(...)`
  - Placeholder policy for when a conversation Window can open (Spark readiness + mutual participation + emotional readiness + no break active).
- `isMessagingAvailableForWindow(...)`
  - Placeholder availability gate for messaging controls based on Window state.
- `getWindowPauseState(...)`
  - Placeholder pause-state normalizer (paused flag + pause metadata).
- `determineWindowRhythm(...)`
  - Placeholder rhythm classifier (`gentle`/`normal`/`reflective`) using reply delay, emotional space need, and prompt density.
- `getIntentionalPacingRecommendation(...)`
  - Placeholder recommendation helper to suggest pacing and intentional breaks.
- `getFutureWindowPacingPolicyPlaceholder(...)`
  - Placeholder structure for future message pacing rules.
- `getFutureEmotionalSafetyPlaceholder(...)`
  - Placeholder structure for future emotional safety checks.

## UI integrations made
- Conversation list now includes Window state and rhythm metadata so conversation availability is transparent and paced.
- Conversation detail now derives and displays:
  - resolved Window state
  - resolved rhythm
  - messaging availability status
  - intentional pacing recommendation
  - future pacing policy placeholder hints
  - emotional safety placeholder hints
- Message input/send controls now consume Window availability/pause state and disable when messaging should rest.
- Preserved existing conversation structure and tone; no engagement mechanics, no urgency patterns, and no realtime behavior added.

## Future messaging integration notes
- Keep Window helper signatures stable as frontend adapter boundaries for future APIs.
- Replace placeholder pacing thresholds with product-configurable policy rules once backend support exists.
- Evolve message input gating to consume future policy outputs (per-day cadence, minimum reply spacing, intentional cool-off windows).
- Map Window state/rhythm enums directly to shared backend contracts in future to avoid enum drift across clients.

## Deferred concerns
- No backend persistence for Window state transitions.
- No realtime message delivery/typing/status systems.
- No authentication or profile-based trust gating.
- No push/notification cadence logic.
- No automated domain tests in this pass (manual checks only).

## Manual testing checklist
- [ ] Open `/conversations` and verify conversation list still renders.
- [ ] Verify each conversation shows Window state + rhythm in the list.
- [ ] Select each conversation and verify detail header shows Window status copy and pacing recommendation.
- [ ] Verify paused conversation keeps send controls disabled.
- [ ] Verify non-paused/opening/open conversations keep send controls enabled when messaging is available.
- [ ] Verify no realtime indicators/online pressure/typing-status UI appears.
- [ ] Verify overall conversation tone remains calm and non-urgent.

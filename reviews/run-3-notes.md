# Run 3 Notes — Domain Stabilization Pass

## Files changed
- `apps/web/src/domain/contracts.js`
- `apps/web/src/domain/safety/taxonomy.js`
- `apps/web/src/domain/conversation-session/index.js`
- `apps/web/src/domain/safety/index.js`
- `apps/web/src/domain/glimps/index.js`
- `apps/web/src/domain/index.js`
- `apps/web/src/components/conversations/index.js`
- `reviews/run-3-domain-boundaries.md`
- `reviews/run-3-notes.md`

## Service/orchestration architecture decisions
- Added a platform-neutral orchestration service: `createConversationSessionViewModel(...)` in `domain/conversation-session`.
- Service accepts conversation snapshot + session context, calls Window/Compatibility/Safety helpers, and returns one normalized render contract.
- Conversations UI now consumes service output instead of directly chaining domain helpers.

## Contracts introduced
- Added shared contracts in `domain/contracts.js`:
  - rhythm levels
  - readiness levels
  - safety severity
  - intervention urgency
  - recommendation types
- Added shared safety taxonomy in `domain/safety/taxonomy.js` for cross-channel event categories and severity mapping.

## Safety taxonomy changes
- Conversation safety reporting placeholder now emits shared taxonomy event payloads.
- Glimps moderation placeholder now emits shared taxonomy safety events with channel and severity fields.
- Kept channel-specific evaluators separate while normalizing output vocabulary.

## UI coupling reduced
- `components/conversations/index.js` no longer coordinates Window/Compatibility/Safety function chains.
- UI renders the normalized conversation service view-model and preserves existing behavior/copy tone.

## Issues intentionally deferred
- No backend moderation/reporting pipeline integration.
- No persistence/auth/session model expansion.
- No visual redesign or product-scope expansion.
- No new route/app-level features.

## Manual testing checklist
- [ ] Open `/conversations`; confirm list/detail interaction works as before.
- [ ] Select each conversation; confirm safety/trust/pacing notes still render.
- [ ] Confirm paused conversations still disable send actions.
- [ ] Confirm reflective prompt still renders for each conversation.
- [ ] Confirm Glimps moderation placeholder still returns clear/needs_review status while now including normalized safety events.
- [ ] Confirm no backend/auth dependency required.

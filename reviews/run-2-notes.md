# Run 2 Notes — Frontend Mock Data and Lightweight State Refactor

## Data architecture decisions
- Introduced a centralized mock-data layer under `apps/web/src/data/mocks/` to separate UI rendering from data definition.
- Split domain mock data into dedicated modules:
  - `discovery.js`
  - `conversations.js`
  - `profile.js`
  - `onboarding.js`
  - `glimps.js`
- Added reusable mock factories (`create*MockData`, `create*InitialState`) so components receive consistent, clonable state/data without mutating shared literals.
- Added `shared.js` helpers for cloning and shared display label generation to reduce duplicated structures and prep for API mapping adapters.

## State structure introduced
- Added lightweight shared store utility in `apps/web/src/state/create-store.js`.
- Added app-level frontend state registry in `apps/web/src/state/index.js` for:
  - onboarding progress/form state (`onboardingState`)
  - Glimps creation flow state (`glimpsState`)
  - active conversation (`conversationState`)
  - discovery pacing state (`discoveryState`)
  - UI preferences (`uiPreferencesState`)
- State approach is intentionally minimal (get/patch/reset) to stay simple and scalable without introducing heavy libraries.

## Files created
- `apps/web/src/data/mocks/shared.js`
- `apps/web/src/data/mocks/discovery.js`
- `apps/web/src/data/mocks/conversations.js`
- `apps/web/src/data/mocks/profile.js`
- `apps/web/src/data/mocks/onboarding.js`
- `apps/web/src/data/mocks/glimps.js`
- `apps/web/src/state/create-store.js`
- `apps/web/src/state/index.js`

## Files changed
- `apps/web/src/components/discovery.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/src/components/onboarding/index.js`
- `apps/web/src/components/glimps/create-flow.js`
- `apps/web/src/components/profile-experience.js`
- `reviews/run-2-notes.md`

## Deferred concerns
- No persistence mechanism added (state remains in-memory/session-only).
- No API service layer introduced yet (still mock-driven).
- No backend/auth/realtime/notifications work added (intentionally out of scope).
- Existing static temporal copy remains as-is where untouched to preserve current behavior/visual output.

## Future API integration notes
- New mock factories can be replaced by API adapters that normalize backend payloads to current UI shapes.
- `state/index.js` can become the stable boundary where API responses patch domain state stores.
- `shared.js` can evolve into shared mappers/formatters for time labels and compatibility summaries.
- Components now consume domain data/state boundaries, minimizing rewrites when moving from mock to network data.

## Manual testing checklist
- [ ] Discovery page renders same cards, recommendations, and introduction limit visuals as before.
- [ ] “Send intro” behavior still disables and relabels the clicked button.
- [ ] Conversations list renders correctly and selecting a conversation updates active detail pane.
- [ ] Empty conversation state still shows starter prompts.
- [ ] Onboarding flow still supports back/continue/finish with the same validation behavior.
- [ ] Onboarding compact header behavior still works in route-embedded usage.
- [ ] Glimps flow still supports all steps, preview, and reset-after-complete behavior.
- [ ] Profile experience renders the same reflection/glimps/layers content and layout.
- [ ] Route structure and visuals remain unchanged (`/onboarding`, `/discovery`, `/conversations`, `/profile`).

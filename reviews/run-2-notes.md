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
  - mock session and user state (`sessionState`)
  - onboarding progress/form state (`onboardingState`)
  - Glimps creation flow state (`glimpsState`)
  - active conversation (`conversationState`)
  - discovery pacing state (`discoveryState`)
  - UI preferences (`uiPreferencesState`)
- State approach is intentionally minimal (get/patch/reset) to stay simple and scalable without introducing heavy libraries.

## Session architecture decisions
- Added a dedicated frontend mock session boundary in `apps/web/src/state/session.js` to isolate auth/session concerns from UI rendering.
- Session model supports four explicit prototype states:
  - `anonymous`
  - `onboarding`
  - `signed-in`
  - `incomplete-profile`
- Added `getRouteSessionExperience(path)` and `getRouteSessionGuardHint(path, state)` helpers as route-guard placeholders so future auth logic can plug in without rewriting route components.
- Added `setMockSessionState(nextState)` and optional URL query switching (`?mockSession=<state>`) for manual QA and demos without introducing forms/providers.

## Mock user states added
- `anonymous visitor` is represented by `state: "anonymous"` and `user: null`.
- `onboarding user` is represented by `state: "onboarding"` with a mock user object.
- `signed-in user` is represented by `state: "signed-in"` with `profileComplete: true`.
- `incomplete profile user` is represented by `state: "incomplete-profile"` with `profileComplete: false`.

## Files created
- `apps/web/src/data/mocks/shared.js`
- `apps/web/src/data/mocks/discovery.js`
- `apps/web/src/data/mocks/conversations.js`
- `apps/web/src/data/mocks/profile.js`
- `apps/web/src/data/mocks/onboarding.js`
- `apps/web/src/data/mocks/glimps.js`
- `apps/web/src/state/create-store.js`
- `apps/web/src/state/index.js`
- `apps/web/src/state/session.js`

## Files changed
- `apps/web/src/components/discovery.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/src/components/onboarding/index.js`
- `apps/web/src/components/glimps/create-flow.js`
- `apps/web/src/components/profile-experience.js`
- `apps/web/src/main.js`
- `apps/web/src/state/index.js`
- `reviews/run-2-notes.md`

## Route behavior notes
- `/` remains public and unchanged as the landing experience.
- `/onboarding` is mapped as the onboarding-state experience target.
- `/discovery`, `/conversations`, and `/profile` are mapped as signed-in app experience targets (including incomplete-profile continuity).
- Routes are intentionally **not blocked** yet; instead, mismatched session-state visits show a calm prototype notice and preserve current visuals/flow.

## Deferred concerns
- No persistence mechanism added (state remains in-memory/session-only).
- No API service layer introduced yet (still mock-driven).
- No backend/auth/realtime/notifications work added (intentionally out of scope).
- Existing static temporal copy remains as-is where untouched to preserve current behavior/visual output.
- No login/signup/auth-provider UI added yet (intentionally deferred).

## Future API integration notes
- New mock factories can be replaced by API adapters that normalize backend payloads to current UI shapes.
- `state/index.js` can become the stable boundary where API responses patch domain state stores.
- `shared.js` can evolve into shared mappers/formatters for time labels and compatibility summaries.
- Components now consume domain data/state boundaries, minimizing rewrites when moving from mock to network data.
- Replace `sessionState` mock lifecycle with real auth session hydration and token refresh handling.
- Replace guard hints with actual route guards (redirects/soft gates) once backend auth and profile completeness checks exist.
- Keep `getRouteSessionExperience` as the central access policy map to avoid policy drift across UI layers.

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
- [ ] Validate each mock session variant with query param switching:
  - `/?mockSession=anonymous`
  - `/?mockSession=onboarding`
  - `/?mockSession=signed-in`
  - `/?mockSession=incomplete-profile`
- [ ] Confirm signed-in routes still render current content even when prototype guard hint appears (no hard blocking yet).

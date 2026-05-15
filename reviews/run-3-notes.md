# Run 3 Notes — Safety and Trust Architecture (First Pass)

## Safety architecture decisions
- Added a platform-neutral Safety domain module under `domain/safety` with explicit, explainable safety-state contracts.
- Modeled safety as transparent rule-based state transitions (no scoring, no ML, no hidden logic).
- Kept all logic frontend-only and mock-data driven.
- Designed for calm trust cues: safety state, trust signal, pacing recommendations, boundary checks, and gentle interventions.
- Added a reporting hook placeholder contract that can later connect to moderation/reporting services without changing current UI behavior.

## Files/modules created or updated
- Updated `apps/web/src/domain/safety/index.js`.
- Updated `apps/web/src/domain/index.js` (re-exports for Safety domain helpers).
- Updated `apps/web/src/data/mocks/conversations.js` (mock safety context + boundary preference payloads).
- Updated `apps/web/src/components/conversations/index.js` (safety/trust integrations in conversation detail).

## Placeholder logic introduced
- `determineComfortSignals(...)`
- `determineSafetyState(...)`
- `createPauseRecommendation(...)`
- `determineTrustSignals(...)`
- `checkBoundaryPreferences(...)`
- `suggestGentleIntervention(...)`
- `createReportingHookPlaceholder(...)`
- Expanded `createSafetyState(...)` and safety enums:
  - safety states: `comfortable`, `uncertain`, `pause_recommended`, `check_in_recommended`, `boundary_crossed`
  - trust states: `steady`, `growing`, `needs_care`
  - intervention types: `gentle_check_in`, `pace_slowing`, `boundary_reflection`

## UI integrations made
- Conversation detail now shows calm, explainable Safety/Trust hints:
  - current safety state
  - trust signal
  - pause recommendation
  - gentle intervention suggestion
  - boundary preference check status
  - future reporting foundation note
- Preserved existing visual structure and tone (no redesign).
- Maintained non-punitive messaging and avoided aggressive warning copy.

## Future moderation/reporting integration notes
- `createReportingHookPlaceholder(...)` is the stable hook for future reporting pipelines.
- Future backend moderation can:
  1. supply conversation safety events
  2. map events to existing safety/trust contracts
  3. submit report payloads via the reporting hook contract
- This keeps domain logic explainable and portable across web/mobile clients.

## Deferred concerns
- No backend/database integration.
- No real authentication/session verification changes.
- No moderation enforcement, auto-actions, or punitive mechanics.
- No telemetry/behavior-tracking or engagement optimization patterns.
- No ML-based safety scoring.

## Manual testing checklist
- [ ] Open `/conversations` and verify list/detail interaction remains functional.
- [ ] Select each conversation and confirm safety state and trust signal render in detail header.
- [ ] Confirm paused conversation still disables message send actions.
- [ ] Confirm boundary-check note changes based on mock conversation context.
- [ ] Confirm intervention note remains calm and non-punitive.
- [ ] Confirm reflective prompt still renders and conversation UI remains visually consistent.
- [ ] Confirm no backend/auth dependency is required for safety rendering.

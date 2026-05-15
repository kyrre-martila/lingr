# Run 3 Notes — Glimps Domain System (Structured)

## Glimps domain decisions
- Introduced a concrete `domain/glimps` contract to model Glimps as a reflective, lightweight moment object rather than social content.
- Added canonical Glimps enums for:
  - lifecycle state: `draft`, `shared`, `expired`, `archived`
  - privacy level: `private`, `connection_only`, `visible_for_matching`
  - emotional tone: `soft`, `open`, `tender`, `grounded`, `uncertain`
- Added a pure draft factory (`createGlimpsDraft`) so UI/state layers consume a normalized shape.
- Added domain validation (`validateGlimps`) to keep flow checks out of template/render concerns.
- Kept all logic frontend-only with no backend/auth/database dependency.

## Files/modules created or updated
- Updated `apps/web/src/domain/glimps/index.js` with full Glimps domain model, validation, expiration placeholder, and moderation placeholder helpers.
- Updated `apps/web/src/domain/index.js` exports to expose new Glimps domain functions and constants.
- Updated `apps/web/src/data/mocks/glimps.js` to create initial state from domain factory.
- Updated `apps/web/src/state/glimps.js` to initialize/store Glimps validation snapshot.
- Updated `apps/web/src/components/glimps/create-flow.js` to use domain-backed fields and checks while preserving flow structure.

## Validation rules added
- Reflection is required and trimmed.
- Reflection max length placeholder enforced (`280` chars).
- Mood is required.
- Image note max length placeholder enforced (`160` chars).
- State value must be one of supported Glimps states.
- Privacy value must be one of supported privacy levels.
- Emotional tone value must be one of supported tone values.
- Timestamp must be parseable (`createdAt`).

## Placeholder logic introduced
- `getGlimpsExpirationState(...)`:
  - computes age in hours from `createdAt`
  - intentionally returns a placeholder expiration decision (`shouldExpire: false`) pending policy/API rules.
- `evaluateGlimpsSafetyPlaceholder(...)`:
  - lightweight text-signal scanning
  - returns representational moderation flags/status only
  - no enforcement and no reporting/escalation workflows yet.

## Future API integration notes
- Keep `createGlimpsDraft` and `validateGlimps` signatures stable for API adapter parity.
- Replace local timestamp generation with backend-issued timestamps/IDs when persistence begins.
- Replace placeholder moderation signal scanning with backend policy/moderation service contracts.
- Replace expiration placeholder with server-configured window rules and lifecycle transitions.
- Map domain enums directly to future API payload schema to avoid UI string drift.

## Deferred concerns
- No persistence or API calls.
- No auth/identity linkage.
- No feed/public engagement mechanics.
- No media upload pipeline (image note remains text reference only).
- No strict runtime schema library (e.g. zod/TS types) yet.
- No automated tests yet for new Glimps domain helpers.

## Manual testing checklist
- [ ] Open `/` and verify Glimps section still renders.
- [ ] Complete Glimps flow with reflection + mood + privacy + tone and confirm preview renders values.
- [ ] Leave reflection empty and verify flow blocks continuation at required step.
- [ ] Leave mood empty and verify flow blocks continuation at required step.
- [ ] Verify prompt remains optional.
- [ ] Verify image note remains optional.
- [ ] Verify preview shows placeholder metadata lines for validation/safety/expiration.
- [ ] Confirm completion step still states local/session-only behavior.
- [ ] Confirm no network/API dependency required for flow.

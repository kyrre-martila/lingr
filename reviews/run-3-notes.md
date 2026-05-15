# Run 3 Notes — Domain Architecture Groundwork

## Domain folders/modules created
- `apps/web/src/domain/index.js`
- `apps/web/src/domain/glimps/index.js`
- `apps/web/src/domain/layers/index.js`
- `apps/web/src/domain/spark/index.js`
- `apps/web/src/domain/discovery/index.js`
- `apps/web/src/domain/pulse/index.js`
- `apps/web/src/domain/window/index.js`
- `apps/web/src/domain/compatibility/index.js`
- `apps/web/src/domain/safety/index.js`

## Concepts modeled
- **Glimps**: lightweight creation policy contract via `canCreateGlimps` and reason enums.
- **Layers**: reveal-depth calculator via `calculateLayerRevealState`.
- **Spark**: simple connection representation via `createSpark`.
- **Pulse**: emotional tempo snapshot via `createPulse`.
- **Window**: conversation span representation via `createConversationWindow`.
- **Intentional discovery**: daily pacing model via `createDailyDiscoveryLimit`.
- **Emotional compatibility**: normalized compatibility input contract via `createEmotionalCompatibilityInput`.
- **Safety**: safety-state and flags contract via `createSafetyState` + `SAFETY_STATES`.

## Key architecture decisions
- Added a **platform-neutral domain layer** under `src/domain` to keep product mechanics reusable outside DOM components.
- Kept domain utilities **pure and side-effect free** where possible so web and mobile can share behavior.
- Added a **single domain barrel export** (`domain/index.js`) to support future shared imports.
- Integrated limited placeholder usage into web state where low-risk:
  - `state/glimps.js` now carries a `creationPolicy` snapshot.
  - `state/discovery.js` now derives introduction limits from domain utility output.

## Intentionally placeholder logic
- No real matching/scoring engine for compatibility or Spark progression.
- No backend persistence, no API contracts, and no database schemas.
- No real moderation decisions; safety stays representational only.
- Glimps creation policy is coarse and input-driven; no user history source-of-truth.
- Layer reveal stages are simple thresholds, not behaviorally adaptive.

## Future backend/API integration notes
- Replace domain utility inputs with server-provided values (daily usage counters, trust state, pairing context).
- Keep domain function signatures stable so API adapters can map payloads to domain contracts.
- Add server-side validation parity for Glimps policy and discovery limits.
- Extend Spark/Window with immutable IDs and lifecycle events from backend.

## Future mobile app reuse notes
- Domain modules are UI-agnostic and can be imported by a React Native/mobile client.
- Keep mobile state stores as thin wrappers around these domain functions.
- Introduce shared package extraction later (e.g., `packages/domain`) once mobile repo/module structure exists.

## Deferred concerns
- Domain-level schema validation (runtime guards/TypeScript/zod) deferred.
- i18n-aware date handling and timezone-aware daily limit keys deferred.
- Real compatibility scoring and intent-ranking algorithms deferred.
- Safety escalation workflows and reporting UX deferred.
- Full adoption of domain models across every component/state module deferred to avoid broad churn in Run 3.

## Manual testing checklist
- [ ] Run app and verify existing routes still render (`/`, `/onboarding`, `/discovery`, `/conversations`, `/profile`).
- [ ] Confirm discovery intro counters still render and reflect limit status.
- [ ] Confirm Glimps flow still loads and has no runtime errors from state initialization.
- [ ] Confirm unknown route handling remains unchanged from Run 2 stabilization.
- [ ] Confirm no auth/backend dependency was introduced by domain modules.

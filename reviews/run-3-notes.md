# Run 3 Notes — Spark Domain Architecture (First Pass)

## Spark architecture decisions
- Added a dedicated platform-neutral Spark domain module under `domain/spark` that is independent from UI rendering and state wiring.
- Formalized Spark lifecycle states as a canonical enum:
  - `potential`
  - `invited`
  - `accepted`
  - `paused`
  - `declined`
  - `expired`
- Kept Spark semantics intentionally non-gamified:
  - no swipe concepts
  - no match counters
  - no instant feedback loops
- Modeled Spark as a gradual, intentional connection signal with separate readiness and resonance checks.

## Files/modules created or updated
- Updated `apps/web/src/domain/spark/index.js`
  - Added reusable Spark domain constants and helpers.
- Updated `apps/web/src/domain/index.js`
  - Re-exported Spark domain APIs for cross-module use.
- Updated `apps/web/src/data/mocks/discovery.js`
  - Added mocked Spark fields per discovery card.
- Updated `apps/web/src/components/discovery.js`
  - Integrated Spark status/readiness/resonance metadata and Spark invitation language in UI copy.

## Placeholder logic introduced
- `calculateSoftResonanceSignals(...)`
  - Computes normalized soft resonance signal components and weighted resonance score.
- `canStartSpark(...)`
  - Evaluates whether a Spark invitation can be started based on:
    - current Spark status
    - daily pacing limit
    - connection readiness
    - resonance quality
- `createSparkInvitation(...)`
  - Creates a local/frontend-only Spark invitation object.
- `resolveSparkStatus(...)`
  - Applies soft accept/decline/pause decisions to Spark status transitions.
- `getSparkStatusLabel(...)`
  - Human-friendly status label helper.
- `shouldOpenConversationWindowLater(...)`
  - Placeholder policy for whether Spark progression should open a conversation window later.

## UI integrations made
- Discovery connection cards now show Spark-oriented context:
  - Spark status
  - connection readiness percentage
  - resonance signal percentage
  - invitation readiness state
  - placeholder conversation-window timing status
- Updated CTA copy from introduction language to Spark invitation language where practical.
- Preserved existing discovery page structure and pacing behavior.
- Did not alter conversation architecture, backend, realtime, or auth behavior.

## Future backend/API integration notes
- Keep Spark helper function signatures stable as adapter boundaries for future API integration.
- Replace local `createSparkInvitation` ids/timestamps with backend-issued values.
- Map domain enums directly to backend schema to prevent string drift across clients.
- Move `canStartSpark` pacing inputs to server-configured policy once backend exists.
- Replace placeholder conversation window thresholds with product-configurable server policy.

## Deferred concerns
- No backend persistence.
- No database models/migrations.
- No authentication/identity verification.
- No realtime invitation delivery.
- No push/notification orchestration.
- No analytics or experimentation logic.
- No automated domain tests yet (manual pass only in this run).

## Manual testing checklist
- [ ] Open `/discovery` and verify existing cards still render.
- [ ] Verify each card displays Spark status/readiness/resonance text blocks.
- [ ] Verify CTA button label reads “Send Spark invitation”.
- [ ] Click Spark CTA and confirm button changes to “Spark invitation saved” and disables.
- [ ] Verify invitation readiness text differs between `potential` and `invited` mock states.
- [ ] Verify conversation-window placeholder text renders without API/network calls.
- [ ] Verify daily pacing indicator remains visible and unchanged.
- [ ] Verify no swipe or match-counter language appears in updated discovery card interactions.

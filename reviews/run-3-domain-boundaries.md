# Run 3 Domain Ownership Boundaries

## Ownership map
- **Pacing recommendations**: `domain/window` computes rhythm and intentional pacing recommendation; conversation session service composes it for UI.
- **Safety recommendations**: `domain/safety` computes safety state, trust signal, pause recommendation, and intervention guidance.
- **Compatibility hints**: `domain/compatibility` computes compatibility signals and reflective hints.
- **Spark readiness**: `domain/spark` owns spark invitation and readiness status contracts.
- **Window availability**: `domain/window` owns open/pause/availability state checks.
- **Glimps moderation flags**: `domain/glimps` owns Glimps channel moderation evaluation but now emits shared safety taxonomy events.
- **Reporting/moderation event shape**: `domain/safety/taxonomy` owns cross-channel event category/severity structure.

## Orchestration boundary
- **Conversation orchestration** is owned by `domain/conversation-session`.
- UI components must consume normalized service output and avoid direct cross-domain orchestration.

## Contract boundary
- Shared lightweight enums live in `domain/contracts.js` and are used for rhythm/readiness/severity/urgency/recommendation typing.

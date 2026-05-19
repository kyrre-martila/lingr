# Run 11.2 — Guess Me MVP

## Architecture decisions
- Implemented Guess Me as a dedicated app-session boundary in `chat-app-service`, parallel to Match Cards.
- Kept one-prompt session model to avoid overbuilding and preserve calm interaction.
- Added reciprocal reveal gating in service layer so reveal is impossible until both answer + guess are present.
- Persistence remains conversation-scoped and relationship-isolated through participant checks.

## Prompt design choices
- Added a small prompt bank with safe, low-pressure topics and fixed 4-option structure.
- Stored prompt keys and option keys as localization keys to keep copy centralized and translatable.
- Avoided high-pressure or diagnostic wording by design.

## Deferred complexity
- Multi-round Guess Me sessions.
- Prompt-category browsing UI.
- Rich reveal narration variants.
- Message timeline card rendering of Guess Me state transitions.

## Risks
- Without dedicated Guess Me timeline renderer, UI may lag behind service capabilities.
- Option key validation currently trusts server prompt bank; strict enum validation can be added later.
- Future richer app-state retrieval endpoints may be needed for production synchronization.

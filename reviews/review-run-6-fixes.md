# Run 6 Stabilization Fixes — Glimps Persistence

## Scope
Addressed Run 6 P0 issues for ownership safety, contract consistency, DTO boundaries, validation, archive semantics, and conformance coverage.

## Changes made
- Centralized Glimps contract constants in shared contracts:
  - `REASON_CODES.GLIMPS.NOT_FOUND`
  - `REASON_CODES.GLIMPS.INVALID_STATE_TRANSITION`
  - `INTERNAL_ID_STRATEGY.API_GLIMPS_ID_PREFIX`
  - `GLIMPS_STATE`, `GLIMPS_PRIVACY_LEVEL`, `GLIMPS_EMOTIONAL_TONE`
- Updated API Glimps service to consume shared constants (removed hardcoded enum/reason literals).
- Preserved DTO redaction boundary through explicit `toClientGlimps` mapper only.
- Hardened archive behavior:
  - Owner-scoped lookup first.
  - 404 with shared Glimps reason when missing.
  - Idempotent return if already archived.
  - Explicit transition to archived state and archived timestamp otherwise.
- Fixed web/backend state drift by replacing frontend/mock `state: 'shared'` with backend-compatible `state: 'published'`.
- Added backend service tests for:
  - anonymous create rejection,
  - enum validation rejection,
  - archive idempotency,
  - shared not-found reason code for archive.

## Notes
- No new product features were added.
- No frontend redesign was performed.
- No Spark/Conversation/Message persistence was added.

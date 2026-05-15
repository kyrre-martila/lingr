# Run 4 Notes — Data Contract Groundwork

## Files/modules created
- `reviews/run-4-data-contracts.md`
- `reviews/run-4-notes.md`

## Contract decisions made
- Established normalized, platform-neutral domain contracts for:
  - User/Profile
  - Glimps
  - Layers
  - Spark
  - Window
  - Conversations
  - Emotional Compatibility
  - Safety
- Defined four shape levels per domain where relevant:
  - persisted entity shape
  - API response shape
  - client view-model shape
  - ownership/relationship rules
- Standardized ID prefixes and timestamp formatting conventions across all domains.
- Added explicit privacy boundaries for internal-only vs client-safe fields.
- Defined placeholder persistence assumptions without introducing DB schema or backend implementation.

## Future migration notes
- Convert contract spec into shared runtime types/validators in `apps/web/src/domain/contracts.js` (or adjacent typed contract module).
- Add DTO adapter/mapping layer so existing mocks/domain services emit contract-compliant shapes.
- Add client-safe redaction mappers per domain before any external API exposure.
- Preserve current UI behavior by adapting shape at service boundaries rather than rewriting feature components first.
- Plan versioned API envelope (`v1`) before external consumers integrate.

## Risks identified
- Enum drift risk if contracts are not codified in shared constants soon.
- Privacy leakage risk if internal fields are returned directly from future persistence models.
- Overlap risk between Safety and Window recommendations if ownership is not enforced in application services.
- Compatibility/Spark semantic overlap may cause inconsistent readiness messaging unless mapped via shared contract vocabulary.
- Potential migration churn if ID/timestamp conventions are not applied consistently in upcoming implementation tasks.

## Manual review checklist
- [ ] Confirm each domain includes persisted entity, API response, and client-view shape guidance.
- [ ] Confirm relationships and ownership rules are explicit and non-conflicting.
- [ ] Confirm all domain IDs use prefix convention and all timestamps are ISO UTC.
- [ ] Confirm internal/private fields are clearly separated from client-safe fields.
- [ ] Confirm no DB schema, endpoint logic, auth-provider wiring, or realtime implementation was introduced.
- [ ] Confirm deferred decisions are captured for unresolved backend architecture choices.
- [ ] Confirm recommended implementation order is practical and aligns with prior run boundaries.

---

## Run 4 Extension — API Architecture Groundwork

## Files/modules created
- `reviews/run-4-api-architecture.md` (new architecture blueprint for platform-neutral API/service layering)

## Files/modules updated
- `reviews/run-4-notes.md` (extended with architecture decisions, migration assumptions, risks, and manual review checklist for API layer)

## Architecture decisions made
- Defined a layered API architecture split into:
  - contracts
  - service boundaries
  - transport abstraction
  - domain client implementations
- Established nine future-facing domain client/service boundaries:
  - auth
  - profile
  - glimps
  - discovery
  - spark
  - window
  - conversations
  - compatibility
  - safety
- Standardized canonical envelope patterns for:
  - success responses
  - failure responses
  - async UI state (`idle/loading/success/error`)
- Standardized error taxonomy for:
  - validation
  - domain
  - auth/permission
  - safety/moderation
  - retryable failures
- Locked transport neutrality target so future implementations can swap between REST, RPC, or BFF without rewriting UI consumers.

## Migration assumptions
- Existing frontend behavior remains unchanged while mock services are wrapped with contract-compliant response adapters.
- UI should consume service interfaces and async-state envelopes rather than direct transport APIs.
- Transport adapter injection becomes the only required change when introducing real backend connectivity.
- Domain-by-domain migration is preferred over big-bang replacement.
- A mock transport remains available for local development even after backend adapters are introduced.

## Risks identified
- Contract drift risk if envelopes/error categories are not codified in shared constants and tested.
- Adapter bypass risk if feature modules call mock data directly instead of service interfaces.
- Over-generalization risk if transport layer leaks implementation-specific semantics too early.
- Auth boundary erosion risk if provider-specific logic is embedded into non-auth domain services.
- Cross-platform inconsistency risk if mobile/web diverge on error mapping or safety contract handling.

## Manual review checklist
- [ ] Confirm all nine domain boundaries are documented and non-overlapping.
- [ ] Confirm success/failure envelope conventions are explicit and consistent with Run 4 data contracts.
- [ ] Confirm loading/error/success async-state contract is documented for UI consumers.
- [ ] Confirm required error categories include validation/domain/auth/permission/safety/retryable.
- [ ] Confirm no real HTTP/backend/auth-provider/database/realtime implementation was introduced.
- [ ] Confirm migration strategy preserves existing UI behavior and allows domain-by-domain backend rollout.
- [ ] Confirm mobile reuse constraints are explicitly captured.

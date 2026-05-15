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

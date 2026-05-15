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

---

## Run 4 Extension — Auth Foundation Groundwork

## Files/modules created
- `reviews/run-4-auth-foundation.md` (identity/session architecture foundation for future real auth integration)

## Files/modules updated
- `reviews/run-4-notes.md` (extended with auth foundation decisions, migration assumptions, risks, and manual review checklist)

## Architecture decisions made
- Defined clear ownership boundaries between:
  - auth (identity + claims)
  - session (composed viewer runtime state)
  - profile (profile data + completeness inputs)
  - route access (policy outcomes)
  - safety restrictions (enforcement overlays)
- Normalized terminology across identity and account lifecycle concepts:
  - authenticated user
  - anonymous visitor
  - onboarding user
  - incomplete profile
  - active member
  - paused account
  - safety-restricted account
- Established platform-neutral session contract direction with explicit subcontracts for:
  - session state
  - user identity
  - auth claims
  - permissions
  - visibility
  - account lifecycle state
  - profile completeness
- Adopted composed-state modeling (auth state axis + account lifecycle axis) to avoid enum sprawl and keep policy logic portable.
- Captured explicit route decision outcomes (`allow`, `soft_block`, `hard_block`) and reason-code strategy for future backend-owned guard enforcement.
- Established safety restriction overlay model as orthogonal to authentication provider state.

## Future migration assumptions
- Prototype behavior remains unchanged in this phase; architecture contracts precede enforcement.
- Future provider integrations (email/password, passwordless, Apple, Google, verification systems) map through adapter boundaries into the same normalized identity/session contracts.
- Backend should own final permission and route-access policy evaluation while preserving client contract shapes.
- UI should consume derived session/permission snapshots and avoid provider-specific logic.
- Mobile and web should share the same auth/session vocabulary and policy contract outputs.

## Risks identified
- Contract drift risk if identity/session/permission terms are not codified in shared runtime constants/types.
- Boundary erosion risk if profile or feature modules directly infer auth/provider logic.
- Policy divergence risk if route access and safety restrictions evolve separately without a unified reason-code taxonomy.
- Migration risk if provider-specific claims leak into UI-facing contracts before adapter boundaries are formalized.
- Cross-platform inconsistency risk if mobile introduces parallel auth-state terminology.

## Manual review checklist
- [ ] Confirm no real authentication flow, provider SDK, token system, cookie/JWT session handling, or DB logic was introduced.
- [ ] Confirm auth/session/profile/route/safety ownership boundaries are explicit and non-overlapping.
- [ ] Confirm normalized terminology is consistent across Run 4 docs.
- [ ] Confirm session identity, claims, permissions, visibility, account state, and completeness concepts are all represented.
- [ ] Confirm route access assumptions preserve current prototype behavior while defining future backend guard outcomes.
- [ ] Confirm safety restriction model is documented as an independent overlay, not an auth-provider concern.
- [ ] Confirm deferred decisions capture unresolved implementation choices for future runs.

---

## Run 4 Extension — Persistence Planning Foundation

## Files/modules created
- `reviews/run-4-persistence-plan.md` (database-ready schema planning contracts for core Lingr entities)

## Files/modules updated
- `reviews/run-4-notes.md` (extended with persistence planning decisions, entity boundaries, relationship assumptions, risks, and manual checklist)

## Schema planning decisions
- Defined database-ready planning contracts for:
  - users
  - profiles
  - onboarding state
  - glimps
  - sparks
  - conversation windows
  - conversations
  - messages
  - compatibility snapshots
  - safety events
  - reports/moderation events
- Standardized planned identity and timestamp conventions across entities (opaque prefixed IDs + ISO UTC timestamps).
- Adopted soft-delete/archive-first posture for user-facing entities, with append-only preference for safety/moderation logs.
- Captured client-safe/internal-only field boundaries and mandatory redaction assumptions for safety/moderation/compatibility internals.
- Documented likely access-control checks and query patterns to guide backend implementation without introducing DB code.

## Entity boundaries
- **Identity/account boundary**: `users`, `profiles`, and `onboarding_state` anchor lifecycle and ownership.
- **Discovery/intent boundary**: `glimps` and `sparks` represent authored expression and invitation intent.
- **Messaging boundary**: `conversations`, `conversation_windows`, and `messages` form the durable communication core.
- **Interpretation boundary**: `compatibility_snapshots` store system-generated reflective state snapshots.
- **Trust/safety boundary**: `safety_events` + `reports_moderation_events` provide cross-cutting moderation and policy audit trails.

## Relationship assumptions
- users own profile/onboarding and author glimps/messages/sparks.
- conversations model participant pairs and own message/window/compatibility child records.
- safety/reporting are cross-cutting event models linked to users/content/conversations/messages as needed.
- moderation and policy outcomes can constrain user/content visibility without mutating ownership contracts.

## Risks identified
- Migration risk if enum values and reason-code taxonomies evolve without compatibility mapping.
- Performance risk if participant/message feed indexes are delayed during first persistence rollout.
- Privacy risk if internal moderation/safety fields bypass redaction mappers.
- Model-evolution risk if participant model must expand beyond pair conversations earlier than expected.
- Operational risk if retention and purge policies are deferred too long after initial persistence launch.

## Manual review checklist
- [ ] Confirm all required entities have purpose, identifiers, fields, relationships, ownership, privacy, timestamps, and delete/archive assumptions.
- [ ] Confirm relationship map is explicit and matches current domain boundaries.
- [ ] Confirm internal-only fields and never-expose categories are clearly listed.
- [ ] Confirm likely query patterns and indexing assumptions are practical for the current product flow.
- [ ] Confirm access-control checks cover participant-only messaging, owner-only edits, and moderation-only internal queries.
- [ ] Confirm migration notes avoid ORM/database implementation details while still guiding incremental rollout.
- [ ] Confirm deferred decisions are explicit and do not block immediate contract codification.

---

## Run 4 Stabilization — Prompt 6 Contracts & Boundaries

### Files/modules created
- `apps/web/src/domain/contract-fixtures.js`
- `apps/web/src/services/discovery-service.js`
- `apps/web/src/services/conversations-service.js`
- `reviews/review-run-4-fixes.md`

### Files/modules updated
- `apps/web/src/domain/contracts.js`
- `apps/web/src/components/discovery.js`
- `apps/web/src/components/conversations/index.js`
- `reviews/run-4-notes.md`

### Key stabilization outcomes
- Codified executable shared contracts, enums, and lightweight validators for Run 4 architecture seams.
- Added canonical reason-code registry shared across auth/route/safety/moderation/validation/permission outcomes.
- Added DTO/API golden fixtures for major domains and standard success/error envelopes.
- Introduced service boundaries for discovery and conversation mock reads; UI now consumes services instead of direct mock index snapshots.
- Codified policy precedence order in a resolver helper to avoid cross-module drift.
- Reinforced redaction boundary expectations (client-safe mapper boundary required before backend serialization).

### Deferred
- Remaining direct mock access in lower-risk modules intentionally deferred to avoid broad rewrites.

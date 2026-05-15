# Run 4 Persistence Plan — Database-Ready Domain Schema Contracts

## 1) Persistence model overview

This document defines **database-ready planning contracts** for Lingr core entities while intentionally avoiding implementation details such as ORM setup, migrations, or backend endpoints.

Scope:
- Core persisted entity boundaries and shape assumptions
- Relationship map and ownership rules
- Client-safe vs internal-only field boundaries
- Query/access-control assumptions for future backend implementation
- Migration and indexing strategy notes

Out of scope:
- Real database selection or provisioning
- ORM model definitions
- SQL/NoSQL schema migration files
- Endpoint or service implementation

Cross-cutting persistence conventions (planned):
- IDs are opaque string identifiers with stable prefixes (`usr_`, `prf_`, `gsp_`, `spk_`, `cwin_`, `cnv_`, `msg_`, `cmp_`, `sev_`, `mod_`).
- All persisted entities include `createdAt` and `updatedAt` (ISO 8601 UTC).
- User-facing deletes are generally soft-delete first unless compliance or abuse workflows require hard delete.
- Internal moderation, policy, and audit details are persisted but redacted from client-safe responses.

---

## 2) Entity list

## 2.1 users
- **Purpose**: canonical account record and identity anchor.
- **Primary identifier**: `userId` (`usr_*`).
- **Important fields**:
  - `authSubjectRef` (future provider mapping)
  - `status` (`active`, `paused`, `deleted`, `restricted`)
  - `primaryProfileId` (nullable at account creation)
  - `deletionRequestedAt`, `deletedAt`
- **Relationships**:
  - 1:1 to `profiles`
  - 1:1 to current `onboarding_state`
  - 1:N authored `glimps`
  - N:N conversation participation via `conversations`
  - 1:N authored `messages`
  - 1:N submitted `reports_moderation_events`
- **Ownership rules**:
  - User owns account-level editable state; safety/moderation systems can impose restriction status.
- **Visibility/privacy**:
  - Internal identity mapping and restriction rationale are internal-only.
- **Timestamp fields**: `createdAt`, `updatedAt`, `pausedAt?`, `deletedAt?`.
- **Soft delete/archive**:
  - `status=deleted` + `deletedAt` retained for restoration/compliance windows.
- **Future indexing**:
  - unique `authSubjectRef` (nullable unique where supported), index on `status`.
- **Future migration concerns**:
  - provider-agnostic subject mapping may evolve to multi-provider link table.

## 2.2 profiles
- **Purpose**: user-facing self-description and discoverability attributes.
- **Primary identifier**: `profileId` (`prf_*`).
- **Important fields**:
  - `userId` (unique)
  - `displayName`, `pronouns`, `bio`, `locationRegion`
  - `profileCompletenessPercent`
  - `visibility` (`discoverable`, `limited`, `hidden`)
  - `avatarAssetRef`
- **Relationships**:
  - belongs to `users`
  - referenced by discovery and conversation participant views (read models)
- **Ownership rules**:
  - user edits own profile; moderation can override visibility state.
- **Visibility/privacy**:
  - most fields client-safe; moderation notes/internal flags hidden.
- **Timestamp fields**: `createdAt`, `updatedAt`.
- **Soft delete/archive**:
  - profile record retained while user exists; historical snapshots may be kept separately later.
- **Future indexing**:
  - unique `userId`, index on `visibility`, optional partial indexes for discovery filters.
- **Future migration concerns**:
  - profile completeness may move from stored scalar to computed projection.

## 2.3 onboarding_state
- **Purpose**: track onboarding progress and completion checkpoints.
- **Primary identifier**: `onboardingStateId` (`onb_*`) or unique by `userId`.
- **Important fields**:
  - `userId` (unique)
  - `currentStepKey`, `completedStepKeys[]`
  - `isCompleted`, `completedAt?`
  - `lastDraftPayload` (internal JSON, optional)
- **Relationships**:
  - belongs to `users`
- **Ownership rules**:
  - user progression updates own state; system can reset for policy/product transitions.
- **Visibility/privacy**:
  - step progress may be client-safe for own session only.
- **Timestamp fields**: `createdAt`, `updatedAt`, `completedAt?`.
- **Soft delete/archive**:
  - usually not deleted; historical onboarding versions may be archived.
- **Future indexing**:
  - unique `userId`, index `isCompleted` for lifecycle transitions.
- **Future migration concerns**:
  - step keys must be versioned to avoid breaking old progress after onboarding redesign.

## 2.4 glimps
- **Purpose**: authored short-form reflective posts used in discovery.
- **Primary identifier**: `glimpsId` (`gsp_*`).
- **Important fields**:
  - `authorUserId`
  - `title`, `body`, `moodTags[]`
  - `visibility` (`public_discovery`, `matched_only`, `private`)
  - `moderationState` (`clear`, `needs_review`, `restricted`)
  - `publishedAt?`, `expiresAt?`
- **Relationships**:
  - belongs to `users`
  - can produce linked `safety_events`
  - can be target of `reports_moderation_events`
- **Ownership rules**:
  - author controls content and visibility within policy limits.
- **Visibility/privacy**:
  - moderation rationale internal; state label may be client-safe.
- **Timestamp fields**: `createdAt`, `updatedAt`, `publishedAt?`, `expiresAt?`, `deletedAt?`.
- **Soft delete/archive**:
  - soft delete preferred for recovery/moderation audit.
- **Future indexing**:
  - composite indexes on `(visibility, moderationState, publishedAt desc)` and `authorUserId`.
- **Future migration concerns**:
  - body content moderation artifacts may move to sidecar table/object storage refs.

## 2.5 sparks
- **Purpose**: invitation/intent record for initiating or deepening connection.
- **Primary identifier**: `sparkId` (`spk_*`).
- **Important fields**:
  - `fromUserId`, `toUserId`
  - `conversationId?`
  - `readinessState` (`not_ready`, `tentative`, `ready`)
  - `status` (`pending`, `accepted`, `declined`, `expired`, `revoked`)
  - `message?`, `expiresAt?`
- **Relationships**:
  - references two `users`
  - optional link to `conversations`
- **Ownership rules**:
  - sender creates/revokes pending; recipient accepts/declines.
- **Visibility/privacy**:
  - visible to participants only; internal anti-abuse metadata hidden.
- **Timestamp fields**: `createdAt`, `updatedAt`, `respondedAt?`, `expiresAt?`.
- **Soft delete/archive**:
  - immutable history preferred; status transitions rather than deletes.
- **Future indexing**:
  - indexes on `(toUserId, status, createdAt desc)`, `(fromUserId, createdAt desc)`, pair index `(fromUserId,toUserId,status)`.
- **Future migration concerns**:
  - dedupe/uniqueness policy per user pair may require backfill and conflict resolution.

## 2.6 conversation_windows
- **Purpose**: pacing state controlling message eligibility in a conversation.
- **Primary identifier**: `conversationWindowId` (`cwin_*`).
- **Important fields**:
  - `conversationId` (unique active window)
  - `state` (`open`, `soft_paused`, `paused`)
  - `rhythm` (`reflective`, `steady`, `spacious`)
  - `nextOpenAt?`, `pauseReasonCode?`
  - `canReplyOverride` (internal-only emergency override)
- **Relationships**:
  - 1:1 with `conversations`
  - contributes context to `safety_events`
- **Ownership rules**:
  - system/domain policy owns transitions; users may request pauses.
- **Visibility/privacy**:
  - state and next-open hints can be client-safe; internal reason details restricted.
- **Timestamp fields**: `createdAt`, `updatedAt`, `pausedAt?`, `reopenedAt?`.
- **Soft delete/archive**:
  - window history better modeled via event log later; base row persists.
- **Future indexing**:
  - unique `conversationId`, index `(state, nextOpenAt)`.
- **Future migration concerns**:
  - eventually split current-state row and transition events for auditability.

## 2.7 conversations
- **Purpose**: durable thread container for two participants.
- **Primary identifier**: `conversationId` (`cnv_*`).
- **Important fields**:
  - `participantAUserId`, `participantBUserId`
  - `status` (`active`, `paused`, `closed`)
  - `lastMessageAt?`, `lastMessageId?`
  - `originSparkId?`
- **Relationships**:
  - N:1 to participants (`users`)
  - 1:N to `messages`
  - 1:1 to `conversation_windows`
  - 1:N to `compatibility_snapshots`
  - 1:N to `safety_events`
- **Ownership rules**:
  - shared object between participants; closure/pause can be participant or policy initiated.
- **Visibility/privacy**:
  - only participants and authorized moderation tooling can access.
- **Timestamp fields**: `createdAt`, `updatedAt`, `closedAt?`, `archivedAt?`.
- **Soft delete/archive**:
  - archive rather than delete for traceability/safety workflows.
- **Future indexing**:
  - participant lookup indexes for inbox queries, index on `lastMessageAt desc`.
- **Future migration concerns**:
  - may evolve to generic participant join model if group conversations are introduced.

## 2.8 messages
- **Purpose**: immutable conversation content events.
- **Primary identifier**: `messageId` (`msg_*`).
- **Important fields**:
  - `conversationId`, `authorUserId`
  - `body`
  - `messageType` (`text`, future-safe extensibility)
  - `visibilityState` (`normal`, `redacted`, `removed`)
  - `clientMessageRef?` (idempotency key)
- **Relationships**:
  - belongs to `conversations`
  - authored by `users`
  - may produce `safety_events` / moderation references
- **Ownership rules**:
  - sender owns authored content but moderation/policy can redact/hide.
- **Visibility/privacy**:
  - message body participant-visible unless redacted; moderation annotations internal.
- **Timestamp fields**: `createdAt`, `updatedAt`, `editedAt?`, `deletedAt?`.
- **Soft delete/archive**:
  - prefer redact/remove state over hard delete for audit safety.
- **Future indexing**:
  - composite `(conversationId, createdAt asc)`; idempotency index on `(conversationId, authorUserId, clientMessageRef)`.
- **Future migration concerns**:
  - message edit history may require separate revision table.

## 2.9 compatibility_snapshots
- **Purpose**: point-in-time non-gamified compatibility interpretation for a conversation/pair.
- **Primary identifier**: `compatibilitySnapshotId` (`cmp_*`).
- **Important fields**:
  - `conversationId`
  - `generatedFromVersion` (rules/policy version)
  - `signalSummary` (structured JSON)
  - `readinessLevel`, `recommendationType`
  - `isCurrent`
- **Relationships**:
  - belongs to `conversations`
  - optional provenance links to source entities/events later
- **Ownership rules**:
  - system-generated; users do not directly edit.
- **Visibility/privacy**:
  - client receives curated summary only; raw signal internals internal.
- **Timestamp fields**: `createdAt`, `updatedAt`.
- **Soft delete/archive**:
  - keep historical snapshots for explainability/version audits.
- **Future indexing**:
  - `(conversationId, createdAt desc)`, partial unique for `isCurrent=true` per conversation.
- **Future migration concerns**:
  - schema versioning for `signalSummary` JSON payload.

## 2.10 safety_events
- **Purpose**: normalized cross-channel safety signal/event log.
- **Primary identifier**: `safetyEventId` (`sev_*`).
- **Important fields**:
  - `channel` (`glimps`, `conversations`, `profile`, `system`)
  - `category`, `severity`, `reasonCode`
  - `subjectUserId`, `actorUserId?`
  - `relatedConversationId?`, `relatedGlimpsId?`, `relatedMessageId?`
  - `resolutionState` (`open`, `under_review`, `resolved`, `dismissed`)
- **Relationships**:
  - references `users`; optional refs to `glimps`, `conversations`, `messages`
  - may be linked to `reports_moderation_events`
- **Ownership rules**:
  - system/moderation-owned; not user-editable.
- **Visibility/privacy**:
  - mostly internal; users may see limited consequence states/hints.
- **Timestamp fields**: `createdAt`, `updatedAt`, `resolvedAt?`.
- **Soft delete/archive**:
  - append-only preferred; never hard-delete without explicit compliance policy.
- **Future indexing**:
  - indexes on `subjectUserId`, `resolutionState`, `severity`, and channel+createdAt.
- **Future migration concerns**:
  - taxonomy evolution must keep backward-compatible reason/category mappings.

## 2.11 reports_moderation_events
- **Purpose**: user reports and moderator actions lifecycle log.
- **Primary identifier**: `moderationEventId` (`mod_*`).
- **Important fields**:
  - `reporterUserId?` (nullable for automated/system reports)
  - `targetType` (`user`, `glimps`, `message`, `conversation`)
  - `targetId`
  - `reportReasonCode`, `reportBody?`
  - `status` (`submitted`, `triaged`, `actioned`, `closed`)
  - `actionType?`, `actionedByUserId?`
  - `linkedSafetyEventId?`
- **Relationships**:
  - references reporter/moderator users
  - references target domain objects
  - optional link to `safety_events`
- **Ownership rules**:
  - report submission by users/system; moderation workflow owned by moderators/system.
- **Visibility/privacy**:
  - reporter may see coarse status; detailed moderation notes internal-only.
- **Timestamp fields**: `createdAt`, `updatedAt`, `triagedAt?`, `closedAt?`.
- **Soft delete/archive**:
  - no hard delete by default; compliance retention policy likely required.
- **Future indexing**:
  - indexes on `(status, createdAt)`, `(targetType, targetId)`, `reporterUserId`.
- **Future migration concerns**:
  - separation of user report payload vs moderator action journal may become necessary.

---

## 3) Relationship map

High-level cardinality map:
- `users (1) -> (1) profiles`
- `users (1) -> (1) onboarding_state`
- `users (1) -> (N) glimps`
- `users (N) <-> (N) users` via `conversations` participant pair
- `conversations (1) -> (1) conversation_windows`
- `conversations (1) -> (N) messages`
- `conversations (1) -> (N) compatibility_snapshots`
- `conversations (1) -> (N) safety_events` (optional by channel)
- `glimps/messages/conversations/users -> (N) reports_moderation_events`
- `reports_moderation_events (0..1) -> (1) safety_events` (link when report escalates/creates safety action)

Boundary assumption:
- Messaging and pacing are conversation-centered.
- Discovery content and moderation are author/content-centered.
- Safety and moderation are cross-cutting, event-centric, and mostly internal.

---

## 4) Privacy and visibility rules

Client-safe default principles:
- Only expose data needed for current user experience.
- Expose participant-only data strictly to conversation participants.
- Expose moderation/safety outcomes in limited user-safe wording; hide internal rationale and reviewer metadata.

Planned access tiers:
1. **Public/discovery-visible**: selected profile fields + discoverable glimps content (subject to moderation state).
2. **Participant-visible**: conversation metadata, window state hints, message content for participants.
3. **Owner-visible**: onboarding state, full own profile edit fields, own sparks.
4. **Moderator/internal**: all policy/audit/reason details and linked safety/reporting artifacts.

---

## 5) Internal-only fields

Fields that should **never** be exposed directly to frontend payloads:
- Identity/security linkage: `authSubjectRef`, provider claim raw payloads.
- Moderation internals: reviewer IDs, moderation notes, internal flags, policy rationale details.
- Safety internals: raw classifier/rule details, internal reason traces, confidence internals.
- Enforcement internals: override flags, hidden restriction rationale, policy strategy version internals where sensitive.
- Audit internals: actor IP/device fingerprints (if later introduced), internal request traces.

Fields requiring controlled transformation before client exposure:
- `safety_events.reasonCode/details`
- `reports_moderation_events.actionType/action notes`
- `compatibility_snapshots.signalSummary` (only curated summaries to client)

---

## 6) Query/indexing assumptions

Likely query patterns:
- Inbox/list conversations by participant and recent activity.
- Fetch conversation detail with window + latest messages.
- Append message with idempotency key and window eligibility check.
- Fetch discovery glimps feed by visibility/moderation/time window.
- Fetch incoming/outgoing sparks by user + status.
- Resolve current onboarding state for signed-in user.
- Fetch latest compatibility snapshot per conversation.
- Fetch unresolved safety/report queues for internal tools.

Future indexing considerations:
- Optimize participant-centric queries for conversations.
- Time-ordered indexes for messages and moderation queues.
- Composite filters for discovery (`visibility`, `moderationState`, freshness).
- Partial indexes for “current” records (`compatibility.isCurrent=true`, active conversations).

Access-control checks likely required per query/action:
- User is authenticated and active for private resources.
- Viewer is participant of conversation before reading/sending messages.
- Window state permits reply (or sanctioned override path).
- Viewer owns profile/onboarding/spark action being modified.
- Safety restrictions may block publish/reply/discovery actions.
- Moderator role required for internal safety/reporting queries.

---

## 7) Migration strategy notes

Recommended migration posture (planning only):
- Contract-first persistence: implement schema to mirror contract names and enums where feasible.
- Add persistence in slices (identity/profile -> conversations/messages -> safety/moderation).
- Preserve stable IDs and timestamps across mock-to-real transition.
- Introduce compatibility snapshot versioning from day one (`generatedFromVersion`).
- Keep redaction mappers mandatory between persistence entities and API responses.

Data backfill concerns:
- Existing mock/static data will need deterministic ID generation and timestamp normalization.
- Future enum adjustments require migration-safe mapping tables, not ad hoc string rewrites.
- Conversation participant model may need expansion path to participant join table.

---

## 8) Deferred decisions

Intentionally deferred for later implementation runs:
- SQL vs document store selection.
- Partitioning/sharding strategy for high-volume messages.
- Full-text search strategy for profile/discovery content.
- Encryption-at-rest field-level policy specifics.
- Retention durations and legal hold policy per entity.
- Hard-delete purge workflows and GDPR/CCPA automation details.
- Event sourcing vs state-table hybrid for conversation windows and safety.

---

## 9) Recommended implementation order

1. **users + profiles + onboarding_state**
   - Establish identity/account lifecycle baseline and route/session dependencies.
2. **conversations + conversation_windows + messages**
   - Enable durable messaging core with pacing-state enforcement hooks.
3. **glimps + sparks**
   - Persist discovery and invitation primitives with ownership/privacy controls.
4. **compatibility_snapshots**
   - Add explainable snapshot persistence with versioned contract.
5. **safety_events + reports_moderation_events**
   - Add internal moderation/safety persistence and cross-entity linkage.
6. **hardening pass**
   - finalize indexes, redaction mappers, and access-control policy tests.

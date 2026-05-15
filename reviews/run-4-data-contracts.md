# Run 4 Data Contracts — Backend-Ready Domain Foundations

## 1) Domain contract overview

This document defines lightweight, platform-neutral contracts for Lingr core domains so frontend and future backend integrations can evolve without broad rewrites.

Scope for this run:
- Define stable contract shapes (DTO/API/entity/view-model)
- Normalize identifiers and timestamps
- Clarify privacy and visibility boundaries
- Clarify relationships and ownership rules

Out of scope for this run:
- Database schema design
- Endpoint implementation
- Auth provider implementation
- ORM setup
- Real persistence/realtime systems

---

## 2) Cross-domain contract conventions

### 2.1 Naming conventions
- **Transport/API fields:** `camelCase`
- **Entity shape keys:** `camelCase`
- **IDs:** `<prefix>_<opaqueToken>` (string)
- **Enums:** upper snake in docs (e.g., `WINDOW_STATE.PAUSED`) but serialized values as lowercase snake-case strings (e.g., `"paused"`).
- **Booleans:** positive names (`isPaused`, `isVisibleToPeer`, `canReply`)
- **Collections:** plural nouns (`layers`, `glimpsIds`, `safetyEvents`)

### 2.2 Shared scalar contracts
- `id: string` (opaque, non-sequential)
- `createdAt: string` (ISO 8601 UTC)
- `updatedAt: string` (ISO 8601 UTC)
- Optional domain timestamps follow suffix patterns:
  - `...At` for exact instant (`pausedAt`)
  - `...On` for day-level value (`windowOpensOn`)

### 2.3 Shared metadata objects
- `audit` (internal): actor IDs, moderation notes, internal flags
- `privacy` (internal + partially client-safe): visibility state + policy derivations
- `version` (internal): optimistic concurrency/version marker

Client-safe responses must exclude internal `audit` contents unless explicitly approved in future policy.

---

## 3) Domain contracts

## 3.1 User/Profile

### Persisted entity shape
```ts
UserEntity {
  id: "usr_*";
  authSubjectRef: string | null; // future auth provider mapping
  status: "active" | "paused" | "deleted";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  deletedAt?: ISODateTime;
}

ProfileEntity {
  id: "prf_*";
  userId: "usr_*";
  displayName: string;
  pronouns?: string;
  ageRange?: "18_24" | "25_34" | "35_44" | "45_plus";
  bio?: string;
  layersSummary?: string;
  locationRegion?: string;
  avatarAssetId?: string;
  profileCompleteness: number; // 0-100
  visibility: "discoverable" | "limited" | "hidden";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  audit: { internalFlags: string[] };
}
```

### API response shape (client-safe)
```ts
UserProfileResponse {
  userId: "usr_*";
  profile: {
    profileId: "prf_*";
    displayName: string;
    pronouns?: string;
    ageRange?: string;
    bio?: string;
    layersSummary?: string;
    locationRegion?: string;
    avatarUrl?: string;
    profileCompleteness: number;
    visibility: "discoverable" | "limited" | "hidden";
    updatedAt: ISODateTime;
  };
}
```

### Client view-model
- Same as response, with optional client-only render flags:
  - `isOwnProfile: boolean`
  - `canEditProfile: boolean`

### Relationships / ownership
- `UserEntity (1) -> (1) ProfileEntity`
- User owns own profile edits.

### Placeholder persistence assumption
- Soft-delete semantics (`status`, `deletedAt`) retained for future compliance and recovery workflows.

---

## 3.2 Glimps

### Persisted entity shape
```ts
GlimpsEntity {
  id: "glp_*";
  authorUserId: "usr_*";
  promptId?: string;
  title: string;
  body: string;
  moodTags: string[];
  visibility: "public_discovery" | "matched_only" | "private";
  moderationState: "clear" | "needs_review" | "restricted";
  safetyEvents: SafetyEvent[]; // normalized taxonomy
  publishedAt?: ISODateTime;
  expiresAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  audit: { moderationNotes?: string; reviewerUserId?: string };
}
```

### API response shape (client-safe)
```ts
GlimpsResponse {
  glimpsId: "glp_*";
  author: { userId: "usr_*"; displayName: string; avatarUrl?: string };
  title: string;
  body: string;
  moodTags: string[];
  visibility: "public_discovery" | "matched_only" | "private";
  moderationState: "clear" | "needs_review" | "restricted";
  publishedAt?: ISODateTime;
  expiresAt?: ISODateTime;
}
```

### Client view-model
- Response + derived flags:
  - `isVisibleToViewer: boolean`
  - `isExpired: boolean`

### Relationships / ownership
- `UserEntity (1) -> (N) GlimpsEntity`
- Author owns content lifecycle; safety system may restrict visibility.

### Placeholder persistence assumption
- Expiry is optional and may be policy-driven later.

---

## 3.3 Layers

### Persisted entity shape
```ts
LayerEntity {
  id: "lyr_*";
  userId: "usr_*";
  layerType: "values" | "rituals" | "emotional_needs" | "boundaries";
  content: string;
  revealState: "private" | "available_on_match" | "revealed";
  revealedToUserIds: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

### API response shape
```ts
LayerResponse {
  layerId: "lyr_*";
  ownerUserId: "usr_*";
  layerType: string;
  content: string;
  revealState: "private" | "available_on_match" | "revealed";
  isVisibleToViewer: boolean;
}
```

### Client view-model
- Hide `content` when `isVisibleToViewer` is false and replace with redacted preview copy.

### Relationships / ownership
- `UserEntity (1) -> (N) LayerEntity`
- Layer owner controls reveal state; reveal-to-list can also be system-assisted via compatibility/window policy later.

### Placeholder persistence assumption
- `revealedToUserIds` may later move to join table/event log but contract remains stable via API.

---

## 3.4 Spark

### Persisted entity shape
```ts
SparkInviteEntity {
  id: "spk_*";
  fromUserId: "usr_*";
  toUserId: "usr_*";
  conversationId?: "cnv_*";
  readinessState: "not_ready" | "tentative" | "ready";
  status: "pending" | "accepted" | "declined" | "expired";
  message?: string;
  expiresAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

### API response shape
```ts
SparkInviteResponse {
  sparkId: "spk_*";
  fromUserId: "usr_*";
  toUserId: "usr_*";
  readinessState: "not_ready" | "tentative" | "ready";
  status: "pending" | "accepted" | "declined" | "expired";
  message?: string;
  expiresAt?: ISODateTime;
}
```

### Client view-model
- Response + display helpers:
  - `canRespond: boolean`
  - `statusLabel: string`

### Relationships / ownership
- Between two users, optionally linked to conversation.
- Sender owns creation; recipient owns accept/decline action.

### Placeholder persistence assumption
- Multiple sparks between same pair allowed, but future dedupe rules likely.

---

## 3.5 Window

### Persisted entity shape
```ts
ConversationWindowEntity {
  id: "win_*";
  conversationId: "cnv_*";
  state: "open" | "soft_paused" | "paused";
  rhythm: "reflective" | "steady" | "spacious";
  openUntil?: ISODateTime;
  pausedAt?: ISODateTime;
  pauseReason?: "user_requested" | "safety_recommendation" | "cooldown";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

### API response shape
```ts
WindowResponse {
  windowId: "win_*";
  conversationId: "cnv_*";
  state: "open" | "soft_paused" | "paused";
  rhythm: "reflective" | "steady" | "spacious";
  openUntil?: ISODateTime;
  pauseReason?: string;
  canReply: boolean;
}
```

### Client view-model
- Same as response.

### Relationships / ownership
- `ConversationEntity (1) -> (1 active) ConversationWindowEntity`
- Mutations may be user-triggered or safety-triggered.

### Placeholder persistence assumption
- Keep window history as future event stream; currently contract models active window snapshot.

---

## 3.6 Conversations

### Persisted entity shape
```ts
ConversationEntity {
  id: "cnv_*";
  participantUserIds: ["usr_*", "usr_*"];
  status: "active" | "paused" | "closed";
  startedAt: ISODateTime;
  lastMessageAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

MessageEntity {
  id: "msg_*";
  conversationId: "cnv_*";
  senderUserId: "usr_*";
  body: string;
  messageType: "text" | "reflection_prompt" | "system_note";
  visibility: "participants" | "system_only";
  sentAt: ISODateTime;
  editedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  audit: { moderationFlags?: string[] };
}
```

### API response shape
```ts
ConversationResponse {
  conversationId: "cnv_*";
  participants: Array<{ userId: "usr_*"; displayName: string; avatarUrl?: string }>;
  status: "active" | "paused" | "closed";
  window: WindowResponse;
  compatibility?: EmotionalCompatibilityResponse;
  lastMessagePreview?: {
    messageId: "msg_*";
    bodyPreview: string;
    sentAt: ISODateTime;
    senderUserId: "usr_*";
  };
  updatedAt: ISODateTime;
}

MessageResponse {
  messageId: "msg_*";
  conversationId: "cnv_*";
  senderUserId: "usr_*";
  body: string;
  messageType: "text" | "reflection_prompt" | "system_note";
  sentAt: ISODateTime;
  editedAt?: ISODateTime;
}
```

### Client view-model
- Conversation list item VM may add:
  - `isUnread: boolean`
  - `safetyBadge?: string`

### Relationships / ownership
- `ConversationEntity (1) -> (N) MessageEntity`
- Two participants own participant-visible content.
- System may append `system_note` messages.

### Placeholder persistence assumption
- Messages are append-first; edits allowed with timestamp audit.

---

## 3.7 Emotional Compatibility

### Persisted entity shape
```ts
CompatibilitySnapshotEntity {
  id: "cmp_*";
  conversationId: "cnv_*";
  userPairKey: string; // deterministic sorted user ids
  resonanceLevel: "low" | "medium" | "high";
  pacingAlignment: "misaligned" | "emerging" | "aligned";
  boundaryAlignment: "unknown" | "partial" | "strong";
  reflectiveHints: string[];
  calculatedAt: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
```

### API response shape
```ts
EmotionalCompatibilityResponse {
  compatibilityId: "cmp_*";
  conversationId: "cnv_*";
  resonanceLevel: "low" | "medium" | "high";
  pacingAlignment: "misaligned" | "emerging" | "aligned";
  boundaryAlignment: "unknown" | "partial" | "strong";
  reflectiveHints: string[];
  calculatedAt: ISODateTime;
}
```

### Client view-model
- Keep as non-gamified descriptors; no numeric score exposed.

### Relationships / ownership
- One conversation can have many snapshots over time; API returns latest by default.

### Placeholder persistence assumption
- Snapshot generation is currently local-rule placeholder; likely backend-generated later.

---

## 3.8 Safety

### Persisted entity shape
```ts
SafetyAssessmentEntity {
  id: "saf_*";
  conversationId?: "cnv_*";
  glimpsId?: "glp_*";
  channel: "conversation" | "glimps" | "profile";
  severity: "none" | "low" | "medium" | "high";
  state: "clear" | "needs_attention" | "intervene";
  recommendationType: "none" | "gentle_reflection" | "pause" | "escalate_review";
  reasonCodes: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  audit: {
    detector: "rule_engine" | "manual_review";
    reviewerUserId?: "usr_*";
    internalNotes?: string;
  };
}
```

### API response shape
```ts
SafetyResponse {
  safetyId: "saf_*";
  channel: "conversation" | "glimps" | "profile";
  severity: "none" | "low" | "medium" | "high";
  state: "clear" | "needs_attention" | "intervene";
  recommendationType: "none" | "gentle_reflection" | "pause" | "escalate_review";
  userFacingNote?: string;
  createdAt: ISODateTime;
}
```

### Client view-model
- Add presentational badges only; no raw reason codes shown.

### Relationships / ownership
- Safety can attach to conversations, glimps, and profiles.
- System owns creation and updates; users may trigger reports that create new assessments.

### Placeholder persistence assumption
- Rule-based prototype remains local now; storage contract preserved for later backend moderation pipeline.

---

## 4) Entity relationships (high-level)

- `User -> Profile` (1:1)
- `User -> Glimps` (1:N)
- `User -> Layers` (1:N)
- `Conversation <-> User` (N:2 participants)
- `Conversation -> Messages` (1:N)
- `Conversation -> Window` (1:1 active snapshot)
- `Conversation -> CompatibilitySnapshots` (1:N over time)
- `Conversation/Glimps/Profile -> SafetyAssessments` (1:N)
- `SparkInvite` connects `User -> User` and optionally references `Conversation`

Recommended future references:
- Use opaque IDs in all foreign keys.
- Keep relationship traversal API-driven; avoid exposing deep internal joins to clients.

---

## 5) DTO/API conventions

- Response wrappers should be predictable:
  - List response: `{ items: T[], pageInfo: {...} }`
  - Detail response: `{ item: T }`
- Errors (future):
  - `{ error: { code, message, retryable, requestId } }`
- Request metadata (future):
  - `requestId`, `clientVersion`, optional `idempotencyKey` for writes.
- Client-safe contract rule:
  - Never expose internal moderation notes, raw detector details, or auth linkage fields.

---

## 6) ID and timestamp conventions

### ID prefixes
- User: `usr_`
- Profile: `prf_`
- Glimps: `glp_`
- Layer: `lyr_`
- Spark: `spk_`
- Conversation: `cnv_`
- Message: `msg_`
- Window: `win_`
- Compatibility: `cmp_`
- Safety: `saf_`

### Timestamp rules
- Persisted entities require `createdAt` and `updatedAt`.
- Domain event instants use explicit fields (`sentAt`, `calculatedAt`, `pausedAt`).
- Store and transmit UTC ISO 8601 strings.
- Avoid relative labels in DTOs (e.g., “today”, “6h ago”)—format on client.

---

## 7) Privacy/visibility assumptions

- Visibility is explicit per domain (`visibility`, `revealState`, `status`).
- Principle: **minimum necessary disclosure**.
- Internal/private fields (must remain server/internal only in future):
  - moderation notes
  - internal flags
  - auth subject references
  - raw detector metadata
- Viewer-aware responses should include booleans instead of hidden raw logic where practical:
  - `isVisibleToViewer`, `canReply`, `canRespond`, `canEditProfile`

---

## 8) Future backend considerations

1. **Auth integration seam**
   - `authSubjectRef` is reserved on `UserEntity`.
   - Policy layer should derive viewer permissions and populate client-safe booleans.

2. **Policy ownership**
   - Safety and window policy can move server-side while keeping response contracts stable.

3. **Versioning strategy**
   - Add non-breaking fields first.
   - For breaking changes, introduce versioned DTO namespace (`v1`, `v2`) rather than shape mutation in place.

4. **Consistency + idempotency**
   - Writes that can be retried should accept idempotency keys.
   - Use optimistic versioning on mutable entities in future.

5. **Event history**
   - Some snapshot entities (window, compatibility, safety) may later gain append-only event stores; APIs can continue serving latest snapshot shape.

---

## 9) Deferred decisions

- Exact auth claims model and token strategy.
- Pagination standard (`cursor` vs `offset`) and max payload sizes.
- Internationalization strategy for user-facing safety notes.
- Final canonical enum values for all recommendation and reason code sets.
- Data retention windows for deleted users/messages and safety artifacts.
- Whether layers reveal access is ACL list, derived policy, or hybrid.

---

## 10) Recommended next implementation order

1. **Introduce shared contract module in code**
   - Add centralized JS/TS contract constants + light validators/type guards.
2. **Wrap existing mock payloads into contract-compliant DTO adapters**
   - Keep UI behavior unchanged while aligning shapes.
3. **Add conversation-service contract adapter**
   - Ensure conversation session view-model consumes standardized domain responses.
4. **Add privacy filter functions**
   - Explicit client-safe mappers for each domain.
5. **Add lightweight contract tests**
   - Validate IDs/timestamps/enums and redaction rules.
6. **Only then begin backend endpoint scaffolding**
   - Reuse contracts without redesigning UI domain surfaces.

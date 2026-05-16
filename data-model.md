# Lingr — Data Model Addendum (Run 7 Chat)

## Scope of this addendum
This run introduces shared, lightweight calm-chat contracts and DTO expectations for:
- `conversation`
- `conversation_participant`
- `message`

Persistence and transport implementation details remain deferred.

## Conversation model (contract direction)
`Conversation` includes:
- `conversationId`
- `participantIds`
- `sparkId` (linked Spark)
- `state` (`active | paused | closed`)
- `createdAt`
- `updatedAt`

`ConversationParticipant` includes:
- `conversationId`
- `userId`
- `role` (`member | system`)
- `joinedAt`

## Message model (contract direction)
Supported message types:
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

Message contract fields:
- `messageId`
- `conversationId`
- `senderUserId` (nullable for system-originated rows)
- `type`
- `visibility` (`conversation | soft_banner`)
- `deliveryState` (`queued | sent | failed`)
- `content` (typed payload)
- `metadata` (optional, client-safe)
- `createdAt`
- `updatedAt`

## Canonical payload shapes
### `text`
- `text` (string)

### `system`
- `text` (string)
- `tone` (optional string, warm/gentle guidance only)

### `layer_unlock`
Subtle banner-style payload:
- `title` (string)
- `subtitle` (optional string)
- `ctaLabel` (optional string)
- `ctaRoute` (optional string)

### `playing_now`
- `mediaType`: `song | movie | tv_series`
- `title`: string
- `creator`: optional string (artist/director/creator)
- `posterUrl`: optional string (cover/poster placeholder)
- `context`: optional short string

### `app_invite`
- `appId`: `match_cards | guess_me | snuggle`
- `inviteText`: optional string

## Display policy
Even though timestamps and delivery state are contract fields:
- per-message timestamps remain hidden in calm chat UI
- delivery state is minimal transport information, not social pressure
- no “seen at”/read receipts are exposed
- no typing/online presence state is exposed

## Explicitly excluded in this run
Do not define or expose contracts for:
- typing indicators
- online presence
- read receipts
- seen states
- urgency mechanics (streaks, response timers, pressure prompts)

## Product intent constraints
- Playing now data is conversational and lightweight, not profile-defining.
- Layer unlock and system moments should feel warm and subtle, never demanding.
- Contracts should stay client-safe and mobile-reusable (transport-agnostic DTOs).
- Model must avoid constructs that imply urgency loops.

# Lingr — Data Model

## Chat documentation baseline (Run 7)

### Message types
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

### Core message fields
- `messageId`
- `conversationId`
- `senderUserId` (nullable for system-origin events)
- `type`
- `text` (when relevant)
- `payload` (typed JSON payload)
- `createdAt` (internal ordering/audit field)

### UX pressure constraints
Even with internal timestamps:
- do not expose per-message timestamps in default UI
- do not include read receipts
- do not include typing indicators
- do not include online/last-seen presence indicators

### Payload guidance
#### `layer_unlock`
System metadata for newly unlocked profile layer.

#### `playing_now`
- `category`: `song | movie | tv_series`
- title
- optional creator field (artist/director/etc.)
- optional artwork URL

#### `app_invite`
- `app`: `match_cards | guess_me | snuggle`
- optional invite text

## Window positioning in relational model
Window is modeled as a later-stage relationship state, not early chat onboarding.

Progression assumption:
1. default chat
2. gradual familiarity
3. optional Window mutual deepening

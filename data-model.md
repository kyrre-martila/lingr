# Lingr — Data Model Addendum (Run 7 Chat)

## Message model (documentation direction)
`Message` supports the following types:
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

## Recommended message shape
- `messageId`
- `conversationId`
- `senderUserId` (nullable for system messages)
- `type`
- `text` (for `text` and selected `system` payloads)
- `payload` (JSON object for typed cards/events)
- `createdAt` (stored internally)

## Display policy
Even though `createdAt` is stored for ordering and auditability:
- per-message timestamps are hidden in normal chat UI
- no “seen at”/read receipts are exposed
- no typing/online presence state is exposed

## Type payload notes
### `layer_unlock`
Payload includes unlocked layer metadata and optional CTA label.

### `playing_now`
Payload includes:
- `category`: `song | movie | tv_series`
- display title
- optional creator/artist/director text
- optional cover/poster image URL

### `app_invite`
Payload includes app identifier:
- `match_cards`
- `guess_me`
- `snuggle`

and optional invite text.

## Product intent constraints
- Playing now data is conversational and temporary-feeling, not profile-defining.
- System messages should support warmth and context, not pressure.
- Model must avoid constructs that imply urgency loops (streak counters, responsiveness scoring).

# Run 7 Notes — Calm Chat Documentation Alignment

## Documentation updated
- Updated `README.md` to make calm, low-pressure chat the default early connection experience.
- Updated `docs/AI_GUIDE.md` with explicit chat philosophy constraints and implementation guardrails.
- Updated `docs/data_model.md` with message-type vocabulary and pressure-free display constraints.
- Added `DEVELOPMENT_PLAN.md` with Run 7 documentation-first direction and deferred implementation scope.
- Added `wireframe-spec.md` describing default chat layout and + menu structure.
- Added `data-model.md` addendum for chat message typing and payload guidance.

## Philosophy decisions documented
- Chat should feel calm, low-pressure, warm, intentional, and familiar enough to feel natural.
- Chat must avoid online status, typing indicators, last seen, read receipts, per-message timestamps, urgency mechanics, and addictive loops.
- Early connection should be normal chat first; depth should emerge later.

## Message types documented
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

## Chat UX decisions documented
- Default chat: clean interface, subtle Lingr styling, no pressure mechanics.
- Composer: plus (+) button at bottom-left.
- Plus first level: Apps and Playing now.
- Apps list: Match Cards, Guess Me, Snuggle.
- Playing now list: Song, Movie, TV Series.
- Playing now shares as lightweight in-chat cards representing current interests.

## Window direction update
- Window is no longer the early chat experience.
- Window is a later-stage, more exclusive mutual deepening concept.
- Principle: chat is normal first, deeper later.

## Deferred chat concerns
- No backend chat implementation yet.
- No frontend chat implementation yet.
- No realtime messaging mechanics yet.
- No notification-pressure strategy implementation yet.
- No final moderation/event policy integration yet.

## Manual review checklist
- [ ] Confirm all docs align on calm/low-pressure chat principles.
- [ ] Confirm all docs list the same disallowed chat mechanics.
- [ ] Confirm + menu hierarchy matches: Apps / Playing now.
- [ ] Confirm submenu items match exact app/media categories.
- [ ] Confirm message type vocabulary is consistent across docs.
- [ ] Confirm Window positioning is later-stage in every file.
- [ ] Confirm no file suggests implementing features in this run.

## Contracts introduced (this update)
- Added shared conversation contracts in `packages/shared/src/contracts.js`:
  - conversation states: `active | paused | closed`
  - conversation participant role: `member | system`
  - conversation DTO field expectations for client-safe API responses.
- Added shared message contracts:
  - message type vocabulary: `text | system | layer_unlock | playing_now | app_invite`
  - message visibility: `conversation | soft_banner`
  - minimal delivery states: `queued | sent | failed`
- Added typed payload guidance constants:
  - playing now media types: `song | movie | tv_series`
  - app invite app IDs: `match_cards | guess_me | snuggle`
  - canonical DTO shape docs for playing now and layer unlock payloads.
- Added lightweight runtime guards for message type, visibility, delivery state, and playing now media type.

## DTO decisions
- Message DTO is designed to be transport-agnostic and mobile-reusable.
- Message DTO includes `content` as typed payload + optional `metadata` for client-safe hints.
- Conversation DTO includes linked `sparkId` and participant IDs for stable future backend integration.
- Kept IDs prefix-oriented (`cnv_*`, `msg_*`, `usr_*`, `spk_*`) in field expectations only; no persistence coupling introduced.

## Message payload decisions
- `playing_now` payload supports media type, title, optional creator, optional cover/poster placeholder URL, and optional short context.
- `layer_unlock` payload supports subtle banner content (`title`, optional `subtitle`, optional CTA label/route).
- `system` and `text` remain intentionally small and readable.

## Intentionally excluded features
- No typing indicators contracts.
- No online presence contracts.
- No read receipts / seen states contracts.
- No urgency mechanics or pressure loops.

## Deferred concerns
- No database schemas or migrations for conversation/message persistence yet.
- No websocket/realtime delivery semantics yet.
- No API endpoint implementation yet.
- No frontend rendering redesign in this run.
- No notification/ranking pressure mechanics.

## Manual testing checklist
- [ ] Verify all supported message types serialize with canonical payload keys.
- [ ] Verify `isSupportedMessageType` accepts only the five approved types.
- [ ] Verify playing now payload accepts only `song | movie | tv_series` media type values.
- [ ] Verify layer unlock payload shape can represent subtle banner text + optional CTA.
- [ ] Verify no contract introduces typing/presence/read-receipt fields.
- [ ] Verify DTO field expectations are consistent between `contracts.js` and `data-model.md`.

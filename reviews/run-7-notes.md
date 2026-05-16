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

# Run 11 — Chat Apps Foundation

## Architecture decisions
- Introduced a conversation-scoped `AppSession` persistence model keyed to a conversation.
- Added canonical app IDs in shared contracts: `match_cards`, `guess_me`, `snuggle`, `playing_now`.
- Added calm lifecycle vocabulary: `invite`, `accept`, `active`, `complete`, `dismissed`.
- Added service-level boundaries for invite/accept/complete/dismiss transitions with participant authorization checks.

## Deferred complexity
- No app-specific game logic for Match Cards, Guess Me, or Snuggle yet.
- No timers, reminders, scoreboards, streaks, rewards, or leaderboards.
- No analytics/stats profile around apps.
- No cross-conversation or global app profile.

## Future extensibility
- `AppSession` can host future app payload metadata while staying conversation-scoped.
- Additional app IDs can be added via shared contracts without changing lifecycle semantics.
- Timeline system rows can bind to app lifecycle events while preserving calm tone.

## Risks
- If future app implementations bypass the shared contract constants, string drift could reappear.
- If app sessions are queried outside conversation membership checks, relationship isolation could regress.
- Lifecycle policy currently allows direct transitions; stricter transition matrices may be needed when app-specific interactions are implemented.

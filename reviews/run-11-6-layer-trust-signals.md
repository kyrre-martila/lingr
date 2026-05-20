# Run 11.6 — Layer trust signals (Prompt 4)

## Architecture decisions
- Chat Apps now emit canonical trust signals into the same relationship-scoped trust pipeline used by message-turn trust.
- Signal points are sourced from `trust_signal_rules` only; app services never hardcode trust deltas.
- Trust remains pair-scoped through `relationship_layers` lookup by conversation participants.

## Signal triggers
- `match_cards_completed`: emitted only when both answers are present and reveal is committed.
- `guess_me_completed`: emitted only when both own answers + both guesses are present and reveal is committed.
- `snuggle_shared`: emitted only when the session first enters a shared `together` moment.
- `playing_now_shared`: emitted on meaningful share message creation (valid payload with title).

## Idempotency choices
- Match Cards and Guess Me award on completion transition only (`completed` gate).
- Snuggle awards only on transition into `together` from non-`together` state.
- No user-facing progression state was added.

## Deferred anti-farming complexity
- No cooldowns, caps, or urgency mechanics were added.
- No extra ledger table introduced in this run.

## Risks
- Concurrent writes around completion/together transitions can still require stronger persistence-level guards in future (event ledger / unique trust events).

# Run 11.6 — Layer trust signal integration (Prompt 4)

## Architecture decisions
- Wired Chat Apps completion moments into the existing trust accumulation engine through `syncLayerAfterTrustSignal`.
- Preserved `TrustSignalRule` as the only source of truth for point values; app services only emit canonical signal types.
- Kept trust relationship-scoped through conversation participants and `relationship_layers` pair state.

## Signal choices and trigger semantics
- `match_cards_completed` is emitted only when both answers exist and reveal is persisted.
- `guess_me_completed` is emitted only when both people have both own answer + partner guess and reveal unlocks.
- `snuggle_shared` is emitted only on first transition into mutual hold (`together`) in a session.
- `playing_now_shared` remains handled from conversation message service when meaningful payload (`title`) is present.

## Idempotency choices
- Match Cards and Guess Me guard on `completed`; once complete, follow-up submissions return state and do not re-emit trust signal.
- Snuggle writes `completionReason = trust_shared_recorded` after first shared moment trust award, preventing repeat trust from hold/release toggles.
- Layer progression trust application remains transactional in layer service, so trust increments and unlock checks stay coherent.

## Deferred anti-farming complexity
- No cooldowns, caps, or anti-abuse heuristics added in this run.
- This is intentional MVP scope to keep calm product behavior while avoiding overfitting reward loops.
- Future controls can be introduced via additional signal guardrails or explicit trust event ledgers if needed.

## Risks
- Snuggle idempotency currently relies on session state field semantics; future refactors must preserve this invariant.
- Without trust event ledger records, post-hoc forensic analysis of misuse is limited.
- Point calibration risk remains operational and may need production tuning through `trust_signal_rules`.

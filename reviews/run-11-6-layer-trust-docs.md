# Run 11.6 — Layer trust progression docs review

## Documentation updated
Updated documentation to align Layer progression with trust + time gating rather than reciprocal message count mechanics.

Touched docs:
- `DEVELOPMENT_PLAN.md`
- `data-model.md`
- `wireframe-spec.md`
- `docs/AI_GUIDE.md`
- `README.md`

## Philosophy decisions
- Layer progression is internal relationship-state progression, not a visible reward system.
- Internal trust score is server-only and never shown to users.
- Minimum elapsed time gates prevent rushed behavior and create emotional pacing.
- Trust signals are intended to reward relationship investment quality, not raw engagement volume.
- Product experience target: progression should feel like “something naturally unfolded.”

## MVP rules documented
- Layer 1 is created by mutual Spark.
- Layer 1 -> Layer 2 requires:
  - minimum 4 hours elapsed
  - requiredTrustScore = 20
- Layer 2 -> Layer 3 requires:
  - minimum 16 hours elapsed
  - requiredTrustScore = 55

MVP trust signal defaults:
- `quality_message_turn`: +2
- `match_cards_completed`: +8
- `guess_me_completed`: +6
- `snuggle_shared`: +5
- `playing_now_shared`: +2

## Deferred admin features
Documented as deferred (not implemented now):
- Admin UI to adjust required trust score per transition.
- Admin UI to adjust minimum elapsed minutes per transition.
- Admin UI to adjust trust signal points.
- Admin UI to enable/disable layer rules and trust signal rules.

## Risks and tradeoffs
- **Calibration risk:** initial trust weights may overvalue/undervalue certain actions; tuning likely required.
- **Opacity risk:** fully hidden progression can feel mysterious if unlock moments are too sparse; UX copy must remain calm and meaningful without exposing mechanics.
- **Abuse risk (deferred controls):** no cooldowns/caps/anti-farming complexity in MVP keeps implementation simple but may permit some optimization behavior.
- **Operational risk:** without admin UI in MVP, threshold tuning requires direct config/data operations.
- **Philosophy consistency risk:** any future visible metric leaks (scores, progress bars, XP framing) would undermine product intent and should remain prohibited.

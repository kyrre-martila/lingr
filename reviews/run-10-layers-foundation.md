# Run 10 — Layers Foundation

## Architecture decisions
- Added a server-authoritative `RelationshipLayer` model keyed by canonical user pair (`primaryUserId`, `secondaryUserId`).
- Layer state is relationship-owned, not profile-global.
- Layer unlocks are produced only from backend transitions:
  - Layer 1 on mutual Spark acceptance.
  - Layer 2/3 on reciprocal conversation progression.
- Unlock moments are inserted as subtle `layer_unlock` system messages.

## MVP thresholds
- Layer 1: mutual spark.
- Layer 2: reciprocal message turns >= 6.
- Layer 3: reciprocal message turns >= 12.
- Thresholds are internal only (no quotas/progress UI).

## Shortcuts intentionally kept
- Reciprocal progression uses alternating sender turns as a simple meaningful-interaction proxy.
- Layer message copy uses neutral generic fallback naming.
- Reveal fields are policy-documented first; full field-level API projection controls can deepen in next run.

## Philosophy tradeoffs
- Prioritized calm progression over transparency of exact thresholds.
- Chose subtle timeline messaging over celebratory mechanics.
- Preserved Layer 0 anonymity behavior by leaving discovery payload constraints unchanged.

## Risks
- Reciprocal-turn proxy may over/under-estimate true conversational depth in edge cases.
- Additional API projection controls are needed to strictly enforce per-layer field visibility on all future profile surfaces.

## Future evolution notes
- Add per-layer profile projection DTO helpers for strict field-level reveal contracts.
- Add optional human-reviewed heuristics for meaningful conversation quality (without gamification).
- Add richer copy localization for unlock messages.

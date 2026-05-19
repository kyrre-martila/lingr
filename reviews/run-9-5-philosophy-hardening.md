# Run 9.5 Philosophy Hardening Review

## Philosophy regressions fixed
- Layer 0 discovery no longer exposes direct identity fields (`displayName`, `locationRegion`) in public introduction payloads.
- Discovery call-to-action language now uses calm action copy (`Spark`, `Not now`) and avoids transactional phrasing.
- Discovery surface copy remains localized, including CTA aria labels and section eyebrow.
- Discovery payload surface keeps non-identifying atmosphere focus (Glimps, reflection, tone, energy tags).

## Lingr alignment improvements
- Discovery presentation now frames each card as an introduction, not a profile listing.
- Empty-state language is calm and non-urgent.
- Layer 0 stays anonymous-first; identity progression is intentionally deferred to post-Spark pathways.

## Deferred cleanup
- Broader timestamp reduction for non-discovery public DTOs (chat/spark/conversation contracts) is deferred to a dedicated contract audit run.
- Legacy docs outside MVP references still contain historical timestamp language and should be normalized later.

## Remaining drift risks
- Future UI edits could reintroduce hardcoded strings on active surfaces unless i18n linting is added.
- Marketplace-style labels can return during growth experiments without explicit philosophy guardrails in PR review.

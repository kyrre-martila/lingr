# Run 10 — Layer Reveal Integration

## Reveal decisions
- Added a single backend resolver `getVisibleProfileForRelationship(viewerUserId, targetUserId)` as the authoritative policy boundary.
- Reveal matrix (MVP):
  - Layer 0: glimpses reflection/tone/energy only; no name, no exact region, no detailed profile fields.
  - Layer 1: first name, broad region, short intro, and selected glimpse context.
  - Layer 2: interests/preferences plus expanded glimpse context.
  - Layer 3: fuller profile including pronouns, exact region, and richer profile text.
- Layer-aware profile projection is now included in conversation list/detail payloads through `visibleProfile`.

## Simplifications kept intentionally
- Interests/emotional values are derived from current `layersSummary` text for MVP, avoiding new schema expansion.
- Broad region uses a simple prefix extraction from `locationRegion`.
- Hidden-state copy is one calm hint: “You'll discover more with time.”

## Future flexibility
- Resolver output is shape-stable and layer-tagged (`revealState`, `layerLevel`) so richer fields can be added without changing policy ownership.
- Policy can move from derived parsing to dedicated profile attributes without changing consumer endpoints.

## Remaining gaps
- Dedicated target-profile endpoint is not added yet; current integration path is conversation surfaces.
- Discovery remains Layer 0 by separate contract and can later reuse the resolver for full unification.
- Localization keys for hidden-state copy/system text should be introduced in a follow-up.

## Risks
- Parsing interests from `layersSummary` may produce coarse results.
- Region broadness via string slicing depends on normalized region coding.
- Additional profile surfaces must consume resolver output to avoid future drift.

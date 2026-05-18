# Run 9 — Region Rollout Foundation

## Architecture decisions
- Added canonical region hierarchy entities: `Country`, `Region`, and `RegionInterestVote` with Prisma-backed contracts.
- Added launch lifecycle states: `closed`, `waitlist`, `open`, `paused`.
- Added region reason codes: `region.closed`, `region.waitlist`, `region.open`, `region.invalid`.
- Added API endpoints for country listing, per-country regions, availability checks, and vote/waitlist submissions.

## GTM assumptions
- Controlled rollout is about density quality, not status/exclusivity.
- Region openings should be demand-informed via vote + waitlist signals.
- Public entry path should stay calm and informative, not restrictive in tone.

## Deferred geo logic
- Full geo-IP inference and automatic region suggestion.
- Multi-level administrative granularity beyond country→region for special markets.
- Region moderation/scoring policy overlays.

## Risks
- Region naming and transliteration inconsistencies across markets.
- Duplicate/invalid email quality in waitlist data.
- Manual seeding quality for worldwide region catalog.

## Inconsistencies found
- Previous docs referenced county/state flow but lacked canonical worldwide entity definitions.
- Prior region availability logic in discovery relied on profile presence, not launch registry.

## Future scaling notes
- Add localized display labels keyed by stable `slug` + locale map.
- Add event stream for region demand trends.
- Add admin workflows for launch status transitions and scheduled openings.

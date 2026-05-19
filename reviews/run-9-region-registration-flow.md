# Run 9 — Region Registration Flow

## Architecture decisions
- Registration now requires pre-auth region availability check using `countryCode` + `regionSlug` before account creation.
- Marketing site passes selected region to app via query parameters (`countryCode`, `regionSlug`, `locale`) and avoids duplicate input in MVP.
- Closed-region path is waitlist-first and account creation is blocked gracefully.
- Discovery remains region-scoped by profile `locationRegion`, with no cross-region exposure in MVP.

## Temporary shortcuts
- Site-to-app transfer uses URL query params instead of signed handoff tokens.
- App onboarding currently consumes region context from URL; deeper persisted wizard integration is deferred.

## GTM assumptions
- Calm unavailable messaging converts better for trust than urgency framing.
- Waitlist dedupe via `(regionId, email)` is sufficient for MVP signal quality.

## Deferred work
- Signed cross-domain session handoff.
- Region-specific auth lifecycle migrations for users whose regions later pause/close.
- Admin and notification orchestration for launch transitions.

## Risks
- Query-param transfer can be user-edited and should be treated as hint, not authority.
- Existing users in paused regions need explicit in-app messaging policy hardening.

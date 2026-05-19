# Run 11.5 Cleanup

## Schema fixes
- Added `SnuggleSession` persistence model and migration `0014_run_11_5_snuggle_persistence`.
- Linked `AppSession` 1:1 optional relation to `SnuggleSession`.

## Route decisions
- Added minimal route-level Chat Apps API for invite, accept, dismiss, complete, and app-specific interaction endpoints.
- Kept envelope contract unchanged and reused existing reason-code taxonomy.

## Transition rules
- App invite lifecycle now guards legal transitions:
  - invite -> active
  - active -> complete
  - invite|active -> dismissed
- Invalid transitions return domain `permission.not_allowed` with HTTP 409.
- Match Cards / Guess Me / Snuggle actions require `active` app lifecycle.
- Snuggle hold/release requires active, non-complete snuggle session.

## Snuggle pressure decisions
- Maintained only neutral aggregate state (`quiet`, `together`, `passed`).
- No partner-presence-specific labels introduced.

## Tests added
- Expanded service-level checks for transition legality and decline semantics alignment.
- Added route registration coverage through app route table wiring (indirectly verified by API test run).

## Deferred risks
- Guess Me currently accepts own-answer + guess in both endpoint variants; future pass may split payload contracts further.
- No moderation/safety escalation logic introduced in this cleanup (deferred to Run 12).

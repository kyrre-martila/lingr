# Run 7 Stabilization Fixes

## Files changed
- `apps/web/src/components/conversations/index.js`
- `apps/api/src/services/conversation-service.js`
- `apps/api/test/conversation-service.test.js`
- `reviews/run-7-notes.md`
- `reviews/review-run-7-fixes.md`

## Plus-menu fixes
- Replaced direct Playing now composer opening from `+` with required two-level skeleton hierarchy.
- Root shows only `Apps` and `Playing now`.
- Apps submenu shows `Match Cards`, `Guess Me`, `Snuggle`.
- Playing now submenu shows `Song`, `Movie`, `TV Series`.
- Leaf selections remain no-op skeleton behavior (no product feature expansion).
- Menu remains hidden by default.

## Accessibility improvements
- Added dialog semantics to menu sheet (`role="dialog"`, accessible title linkage).
- Added `aria-haspopup`, `aria-controls`, and `aria-expanded` wiring on `+` trigger.
- Added Escape-to-close behavior.
- Added focus return to `+` trigger on close.
- Added keyboard-operable nested flow via native buttons and Back/Close semantics.

## API/service hardening
- `app_invite` payload validation now enforces canonical app IDs only:
  - `match_cards`
  - `guess_me`
  - `snuggle`
- Added deterministic duplicate conversation-create conflict handling:
  - on unique conflict (`P2002`), map to existing Spark conversation DTO.
- Added conversation-scoped cursor validation before timeline pagination query.

## Contract fixes
- Enforced canonical `app_invite.appId` values at boundary using shared contract constants.
- Preserved shared error envelope + canonical reason-code semantics.

## Philosophy guardrails added
- Removed active UI path that could post direct `playing_now` shares from plus button in this run.
- Maintained skeleton-only navigation leaves for Apps and Playing now (no pressure features, no gamified mechanics).

## Tests added/updated
- Added app-invite enum validation test.
- Added cursor conversation-scope validation test.
- Added deterministic create-conflict mapping test.

## Intentionally deferred issues
- No realtime messaging.
- No app launch/invite integrations for submenu leaves.
- No full conversation lifecycle transition engine (kept lightweight stabilization scope).
- No redesign of frontend message stream.

## Manual testing checklist
- [ ] `+` menu is hidden by default.
- [ ] Opening `+` shows only `Apps` and `Playing now`.
- [ ] Apps submenu shows exactly `Match Cards`, `Guess Me`, `Snuggle`.
- [ ] Playing now submenu shows exactly `Song`, `Movie`, `TV Series`.
- [ ] Escape closes menu and focus returns to `+`.
- [ ] Back from submenu returns to root menu.
- [ ] App invite API rejects non-canonical app IDs with canonical reason.
- [ ] Timeline cursor from another conversation is rejected.
- [ ] Concurrent duplicate create for same Spark resolves to existing conversation DTO.

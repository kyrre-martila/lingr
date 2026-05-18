# Run 9 Docs Update — Documentation Alignment Summary

## Documents changed
- `DEVELOPMENT_PLAN.md`
- `README.md`
- `docs/AI_GUIDE.md`
- `data-model.md`
- `wireframe-spec.md`
- `reviews/run-9-docs-update.md` (this file)

## Major roadmap updates
- Reworked roadmap to revised run sequence:
  - Run 8.5 — auth hardening
  - Run 9 — discovery MVP
  - Run 10 — layers MVP
  - Run 11 — chat apps MVP
  - Run 12 — safety/moderation MVP
  - Run 13 — region launch system
  - Run 14 — polish
  - Run 15 — beta readiness
  - Run 16 — soft launch
- Removed global-launch framing and replaced with region-by-region execution model.

## Philosophy changes documented
- Elevated Lingr identity to slow, intentional, calm, emotionally safe, anti-pressure, anti-swipe, anti-dopamine optimization.
- Added explicit statement across docs: **“Philosophy must exist in code, not only in copy.”**
- Standardized prohibited mechanics list across docs:
  - online status
  - typing indicators
  - read receipts
  - last seen
  - per-message timestamps
  - urgency mechanics
  - streaks
  - engagement loops

## Auth changes documented
- Locked MVP auth to Lingr-native strategy only:
  - email/password
  - session persistence
  - onboarding gating
  - profile completion gating
- Moved Apple/Google/passwordless/account-linking explicitly to post-MVP deferred scope.

## Chat changes documented
- Standardized chat + menu architecture:
  - bottom-left `+`
  - root: Apps, Playing now
  - Apps: Match Cards, Guess Me, Snuggle
  - Playing now: Song, Movie, TV Series
- Clarified these are optional apps inside chat and not gamification.
- Repositioned Window to later-stage progression only after meaningful chat + Sparks + multiple Glimps + Layer progression.

## Launch strategy updates
- Added region-by-region launch model and rationale: local density and healthy dating pools.
- Added registration flow branch:
  - register → country → region
  - open region → continue
  - closed region → vote + waitlist + email notify
- Added domain topology:
  - `lingr.dating` (marketing)
  - `app.lingr.dating` (web app)
  - `api.lingr.dating` (API)
  - future: `cdn.lingr.dating`, `admin.lingr.dating`
- Added GTM approach: weekly openings, waitlist-driven priority, social hype, email reactivation.

## Localization decisions
- Canonical language: English (`en`).
- Launch-ready language: Norwegian Bokmål (`nb-NO`).
- Enforced translation-key UI architecture (no hardcoded UI strings).
- Kept backend reason codes canonical and non-localized.
- Frontend localization layer translates keys/codes to user-facing strings.

## Deferred ideas (explicit)
- Apple Sign In
- Google Sign In
- passwordless auth
- account linking
- global day-one launch strategy
- any pressure/addiction mechanics conflicting with calm principles

## Inconsistencies found/fixed
1. **Roadmap mismatch**: prior docs used Run 8–13 structure; updated to Run 8.5–16 structure.
2. **Auth ambiguity**: older notes implied broader auth scope possibilities; now clearly MVP-native only + explicit defer list.
3. **Window timing variance**: now standardized as later-stage progression gate in all core docs.
4. **Localization under-specified**: added concrete en + nb-NO baseline and translation-key requirements.
5. **Launch model gap**: added region voting/waitlist flow and density-first launch logic.

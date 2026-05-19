# Lingr — README

A slow dating app built around intentional pacing, emotional safety, and local density.

## Core direction
Lingr is intentionally:
- slow
- intentional
- calm
- emotionally safe
- anti-pressure
- anti-swipe
- anti-dopamine optimization

**Philosophy must exist in code, not only in copy.**

## Non-negotiable product constraints
Never include:
- online status
- typing indicators
- read receipts
- last seen
- per-message timestamps
- urgency mechanics
- streaks
- engagement loops

## Chat structure (MVP)
Default chat is normal-first:
- clean interface
- subtle Lingr visual language
- low-pressure interaction by design

Composer includes a bottom-left **+** button.

Pressing **+** opens root menu:
- Apps
- Playing now

Apps:
- Match Cards
- Guess Me
- Snuggle

Playing now:
- Song
- Movie
- TV Series

These are optional apps inside chat, not gamification mechanics.

## Progression model
Window is not early chat.

Window is a later-stage relationship mode that should happen only after:
- meaningful chat
- Sparks
- multiple Glimps
- Layer unlock progression

## Auth strategy (MVP)
MVP authentication is Lingr-native only:
- email/password
- session persistence
- onboarding gating
- profile completion gating

Deferred until post-MVP:
- Apple Sign In
- Google Sign In
- passwordless auth
- account linking

## Localization foundation
- Canonical language: English (`en`)
- Launch-ready language: Norwegian Bokmål (`nb-NO`)
- UI strings must use translation keys (no hardcoded literals in product UI)
- Backend reason codes remain stable and language-agnostic
- Frontend localization layer translates reason codes and UI keys

Recommended i18n structure:
- `locales/en/*.json` as canonical source copy
- `locales/nb-NO/*.json` as launch translation pack
- shared key namespaces (`auth.*`, `chat.*`, `discovery.*`, `region.*`, `safety.*`)

## Region-by-region launch model
Lingr does not launch globally at once.

User flow:
1. Register
2. Select country
3. Select county/state/region
4. Region open → continue
5. Region closed → vote for region + join waitlist + receive email later

Domain split:
- Marketing: `lingr.dating`
- App: `app.lingr.dating`
- API: `api.lingr.dating`
- Future: `cdn.lingr.dating`, `admin.lingr.dating`

Goal: healthy local dating pools through density-first rollout.

## Go-to-market
No big global launch day.

Launch strategy:
- slow rollout
- one region at a time
- weekly openings
- waitlist-driven priority
- social hype + email reactivation

Possible early sequence:
- Trøndelag
- Troms
- Bergen
- Oslo later

Final order should be determined by waitlist demand.

**Data > assumptions.**

## Discovery philosophy (Run 9 polish)
- Discovery is framed as a calm introduction, one person at a time.
- Primary emphasis is on Glimps and emotional atmosphere, not profile-scanning behavior.
- UX tone uses gentle language (`Send spark`, `Not now`) and warm empty states.
- Avoid swipe metaphors, gamified pacing cues, and urgency copy.


## Region rollout foundation (implemented)
- Canonical models: `Country` (ISO + enabled), `Region` (country-linked slug/name), `RegionInterestVote` (email waitlist + vote signal).
- Launch lifecycle: `closed`, `waitlist`, `open`, `paused`.
- API contracts: `GET /v1/regions/countries`, `GET /v1/regions/:countryCode`, `GET /v1/regions/check`, `POST /v1/regions/vote`.
- Reason codes: `region.closed`, `region.waitlist`, `region.open`, `region.invalid`.
- Controlled density intent: this is not social-status exclusivity; it is healthy pool rollout sequencing.
- Localization constraint: names and UI copy are key-driven and locale-ready (`en` canonical, `nb-NO` launch pack).

## Run 9 localization foundation
- Added namespace-based web i18n foundation under `apps/web/src/i18n/` with `en` canonical + `nb-NO` launch pack.
- Core high-touch surfaces use translation keys (`discovery`, `chat`, `auth`, `onboarding`, `errors`, `regions`).
- Backend reason codes remain canonical and untranslated (frontend maps to `errors.*`).
- Locale handling supports browser detection, manual override persistence, and English fallback.

## Marketing site foundation (`lingr.dating`)
- Added initial launch/waitlist site under `apps/site` for early region rollout momentum.
- Scope is intentionally MVP-only: philosophy framing, simple product explanation, region vote/waitlist form, and placeholder previews.
- Shares calm visual language with the app: warm spacing, non-urgent copy, and low-pressure CTAs.
- Region voting is wired to `api.lingr.dating` region endpoints (`countries`, `regions`, `check`, `vote`).
- Localization-ready foundation includes `en` + `nb-NO` translation packs and key-driven rendering.
- Accessibility baseline includes keyboard-usable controls, skip link, semantic headings, live-region updates, and reduced-motion support.

## Run 9 registration gating integration
- Registration now starts with country → region selection and availability check before account creation.
- Open regions continue into account creation; closed/waitlist regions route to warm waitlist enrollment (email + optional first name + locale + region), with dedupe protection.
- Marketing (`lingr.dating`) can hand selected region into app (`app.lingr.dating`) using MVP query-param transfer to avoid duplicate region entry.
- Region policy for authenticated users: if a region later pauses/closes, users receive graceful unavailable messaging and retain account access boundaries; app must never fail silently.

## Auth/session MVP hardening
- API auth now uses Prisma-backed `users` + `sessions` persistence.
- Passwords are hashed with bcrypt (`12` rounds minimum); plaintext and hashes are never returned by auth routes.
- Session lifecycle uses DB `status` (`active`, `expired`, `revoked`) and 30-day expiration.
- Session tokens are bearer transport values while DB stores only `tokenHash` for lookup/revocation.

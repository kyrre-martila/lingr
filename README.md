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

Layer progression direction (MVP):
- Layer 1 starts at mutual Spark.
- Layer 1 -> Layer 2 requires minimum 4 hours and internal trust score 20.
- Layer 2 -> Layer 3 requires minimum 16 hours and internal trust score 55.

Trust score is internal only (not user-visible) and is used to reward relationship investment quality, not engagement volume.

MVP trust signal defaults:
- `quality_message_turn`: +2
- `match_cards_completed`: +8
- `guess_me_completed`: +6
- `snuggle_shared`: +5
- `playing_now_shared`: +2

Forbidden progression UX patterns:
- progress bars
- visible score/progress counters
- XP/streak/badge language
- “you need X more points” prompts
- “complete actions to unlock” mechanics
- urgency countdown framing

Deferred (not in MVP): cooldowns, daily caps, anti-farming complexity, and admin UI.

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
- UX tone uses gentle language (`Spark`, `Not now`) and warm empty states.
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

## Discovery philosophy hardening (Run 9.5)
- Layer 0 discovery intentionally withholds direct identity markers (name/region) and foregrounds Glimps + emotional atmosphere.
- Discovery is an introduction flow, not profile shopping.
- Public discovery response shape avoids timestamp exposure and urgency cues.
- Action copy stays low-pressure (`Spark`, `Not now`) and must be localized.

## Run 9.5.1 web session transport hardening
- Web session auth uses HttpOnly cookie transport (MVP default), not `localStorage` bearer tokens.
- Cookie policy: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production.
- Canonical auth behavior: expired sessions return `auth.session_expired`; missing/revoked sessions return `auth.requires_auth`.
- Mobile bearer-token strategy remains deferred to a future native secure-storage implementation.
- Layer 0 discovery conformance: no names, no location metadata, no timestamps, no activity/urgency fields in discovery introduction payloads.

## Run 11.7 session-token hashing hardening
- Session token hashing now uses HMAC-SHA256 (`createHmac`) with a server secret (`LINGR_SESSION_SECRET`) instead of raw SHA-256 hashing.
- Production requires `LINGR_SESSION_SECRET`; local development/test uses a safe fallback secret to avoid workflow breakage.
- Existing persisted sessions created with legacy SHA-256 token hashes will no longer validate after deploy and may require users to sign in again.
- No destructive DB migration is required; `sessions.tokenHash` storage model remains unchanged.

## Local manual testing flow (Run 11.7 Prompt 3)

This flow is optimized for a real two-account manual E2E run against Prisma + PostgreSQL.

### Required environment variables

API (`apps/api/.env`):
- `DATABASE_URL` (required): PostgreSQL connection string for Prisma.
- `LINGR_SESSION_SECRET` (recommended local, required in production): HMAC secret for session-token hashing.
- `PORT` (optional, default `4000`).
- `DB_HEALTHCHECK_ENABLED` (optional, default `true`).

Web (`apps/web` runtime):
- `__LINGR_API_BASE_URL` should point at your local API (default in web client is `http://localhost:3000`; set this to your API port if different).
- Mock transport is now **opt-in only** using `window.__LINGR_DEV_USE_MOCK__ = true` in local dev tools.

### Startup + migration + seed order

1. Start PostgreSQL locally.
2. Install dependencies from repo root:
   - `npm install`
3. Generate Prisma client:
   - `npm run db:generate --workspace @lingr/api`
4. Apply Prisma migrations:
   - `npm run db:migrate --workspace @lingr/api`
5. Seed local E2E region defaults (open region for registration):
   - `npm run db:seed:dev-e2e --workspace @lingr/api`
6. Start API:
   - `npm run dev:api`
7. Start web app (in a second terminal):
   - run your existing web dev command

### Two-account manual test checklist

1. Create Account A with:
   - country: `NO`
   - region: `trondelag`
2. Create Account B with:
   - country: `NO`
   - region: `trondelag`
3. Complete onboarding/profile for both so discovery is available.
4. From Account A discovery, send Spark to Account B.
5. In Account B, accept Spark.
6. Open/create conversation from accepted Spark.
7. Send messages both ways and verify they persist after refresh.
8. Use chat apps in the conversation:
   - Match Cards
   - Guess Me
   - Snuggle
   - Playing now
9. Verify trust/layer progression behavior appears as calm system unlock messaging.
10. Log out and log back in for both accounts; verify conversation/session persistence.

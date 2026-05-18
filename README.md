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

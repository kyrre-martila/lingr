# Lingr — AI Guide

Read this before proposing or implementing product changes.

## Product intent
Lingr is a slow dating app built for intentional emotional pacing.

Always optimize for:
- calmness
- warmth
- low pressure
- emotional safety
- meaningful reciprocity

Never optimize for:
- compulsive engagement
- urgency loops
- addictive interaction patterns

**Philosophy must exist in code, not only in copy.**

## Non-negotiable exclusions
Do not add:
- online status
- typing indicators
- read receipts
- last seen
- per-message timestamps
- urgency mechanics
- streaks
- engagement loops

## Chat architecture rules
Default chat is normal-first, calm, and familiar.

Composer behavior:
- include **+** button at bottom-left

On **+** press, root options:
- Apps
- Playing now

Apps list:
- Match Cards
- Guess Me
- Snuggle

Playing now list:
- Song
- Movie
- TV Series

These are optional apps inside chat. They are not gamification systems.

## Window progression policy
Window is later-stage only.

Window should happen only after:
- meaningful chat
- Sparks
- multiple Glimps
- Layer unlock progression

Design principle:
- normal chat first
- depth later

## Auth policy (MVP)
Use Lingr-native auth only:
- email/password
- session persistence
- onboarding gating
- profile completion gating

Do not add in MVP:
- Apple Sign In
- Google Sign In
- passwordless auth
- account linking

## Localization policy
- Canonical language: English (`en`)
- Launch-ready language: Norwegian Bokmål (`nb-NO`)
- UI copy must be translation-key driven
- Backend reason codes stay stable and backend-safe
- Frontend i18n layer handles user-facing translation

Suggested key structure:
- `auth.*`
- `onboarding.*`
- `profile.*`
- `chat.*`
- `apps.*`
- `playing_now.*`
- `region.*`
- `safety.*`

## Region launch policy
Lingr opens region-by-region to protect local match density and dating quality.

Flow to document/build toward:
1. Register
2. Country selection
3. County/state/region selection
4. Open region: continue registration
5. Closed region: vote + waitlist + later email notification

Domain model:
- `lingr.dating` (marketing)
- `app.lingr.dating` (web app)
- `api.lingr.dating` (API)
- future: `cdn.lingr.dating`, `admin.lingr.dating`

## Delivery rules
For this phase, documentation-first changes only.
Do not implement production feature changes unless explicitly requested in a dedicated implementation run.

## Discovery implementation guardrails
Discovery should feel editorial, calm, and emotionally safe.

Required behavior:
- introduction model, one person at a time
- Glimps-first presentation before profile metadata
- quiet actions and low-pressure copy (`Send spark`, `Not now`)
- warm empty/loading/unavailable states

Avoid:
- swipe-stack framing
- gamified counters or urgency language
- celebratory “match” mechanics for spark success

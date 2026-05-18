# Lingr — Data Model Addendum (Run 9 Documentation Alignment)

## Scope
This addendum defines calm-chat and launch-foundation contract direction for:
- conversation and messages
- progression constraints (Layers/Window eligibility)
- auth/session gating signals
- localization-safe reason-code handling
- region launch gating and waitlist flow

## Product safety constraints at data-contract level
Contracts must not introduce or imply:
- online status
- typing indicators
- read receipts
- last seen
- per-message timestamps in UI surfaces
- urgency mechanics
- streak mechanics
- engagement loops

**Philosophy must exist in code, not only in copy.**

## Chat contract direction
Message types remain:
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

Chat app menu contract vocabulary:
- root: `apps`, `playing_now`
- apps: `match_cards`, `guess_me`, `snuggle`
- playing now media: `song`, `movie`, `tv_series`

These values represent optional in-chat activities, not ranking or addiction mechanics.

## Progression and Window eligibility (concept contract)
Window is later-stage only and should be backed by explicit eligibility state.

Suggested eligibility inputs:
- `hasMeaningfulChat` (boolean)
- `sparkCount` (number)
- `glimpsCount` (number)
- `layerProgressLevel` (number)
- `windowEligible` (derived boolean)

Window eligibility should remain derived/server-controlled, not client-invented.

## Auth/session contract direction (MVP)
MVP auth mode: Lingr-native only.

Required auth signals:
- `authProvider`: `lingr_native`
- `sessionState`: `anonymous | onboarding | incomplete_profile | signed_in`
- `onboardingComplete`: boolean
- `profileComplete`: boolean

Deferred auth providers (post-MVP only):
- `apple`
- `google`
- `passwordless`
- account linking identities

## Localization-safe contract direction
- Backend reason codes remain canonical, stable, and non-localized.
- Frontend translates reason codes into localized copy.
- API payloads should expose keys/codes, not region-specific prose.

Suggested response pattern:
- `reasonCode`: machine-safe code (e.g., `route.requires_profile_completion`)
- `messageKey`: optional i18n key for frontend fallback mapping

## Region launch contracts
### Registration region selection
Suggested fields:
- `countryCode` (ISO-style)
- `regionCode` (county/state/region canonical code)
- `regionStatus`: `open | closed | coming_soon`

### Closed region handling
If region is not open:
- `canContinueRegistration`: false
- `canVoteForRegion`: true
- `canJoinWaitlist`: true

Suggested records:
- `region_vote` (`userId`, `countryCode`, `regionCode`, `createdAt`)
- `region_waitlist` (`userId`, `email`, `countryCode`, `regionCode`, `createdAt`, `notifyStatus`)

## Domain topology (documentation contract)
- `lingr.dating` — marketing
- `app.lingr.dating` — web app
- `api.lingr.dating` — API
- future: `cdn.lingr.dating`, `admin.lingr.dating`

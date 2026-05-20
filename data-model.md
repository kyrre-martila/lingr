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

## Discovery MVP foundation (Run 9)
- Shared contract constants:
  - `DISCOVERY_LIMIT_PER_DAY = 3`
  - `DISCOVERY_STATE`: `ready | limit_reached | empty | unavailable`
  - `DISCOVERY_REASON_CODES`: `daily_limit_reached | no_available_people | unavailable_region | onboarding_required | profile_incomplete`
- Persistence additions:
  - `discovery_daily_trackers` for UTC-day authoritative counters.
  - `discovery_views` to prevent repeat introductions.
  - `block_relations` to exclude blocked pairs.
- Discovery service boundary methods:
  - `getDailyDiscovery(viewer)`
  - `getRemainingDiscoveryCount(viewer)`
  - `dismissIntroduction()`
  - `createSparkFromDiscovery()`

## Run 9 Discovery → Spark semantics
- Calm discovery actions vocabulary: `send_spark`, `not_now`.
- `not_now` persists in `discovery_views` and applies a soft cooldown exclusion window (default 14 days).
- `send_spark` performs discovery view marking + Spark creation transactionally from the discovery interaction boundary.
- Duplicate active spark attempts return calm, non-gamified `already_exists` semantics instead of creating duplicates.


## Region rollout foundation (implemented)
- Canonical models: `Country` (ISO + enabled), `Region` (country-linked slug/name), `RegionInterestVote` (email waitlist + vote signal).
- Launch lifecycle: `closed`, `waitlist`, `open`, `paused`.
- API contracts: `GET /v1/regions/countries`, `GET /v1/regions/:countryCode`, `GET /v1/regions/check`, `POST /v1/regions/vote`.
- Reason codes: `region.closed`, `region.waitlist`, `region.open`, `region.invalid`.
- Controlled density intent: this is not social-status exclusivity; it is healthy pool rollout sequencing.
- Localization constraint: names and UI copy are key-driven and locale-ready (`en` canonical, `nb-NO` launch pack).

## Run 9 implementation note — registration gate
- `POST /v1/auth/register` now requires `countryCode` and `regionSlug` with email/password.
- Server checks region availability before account creation and returns region reason codes on closed paths.
- Waitlist persistence remains deduped by `(regionId, email)` with locale + optional firstName updates.

## Run 9.5 auth hardening (implemented)
- `users` persistence now owns email/password credentials (`email`, `passwordHash`).
- `sessions` persistence now owns session token identity via hashed token storage (`tokenHash`) plus status and expiry.
- Session lifecycle semantics:
  - `active`: usable
  - `expired`: returns `auth.session_expired`
  - `revoked`: treated as unauthenticated (`auth.requires_auth` guard behavior)
- MVP expiration policy is fixed 30-day session TTL.

## Layer 0 identity progression guardrail (Run 9.5)
- Discovery Layer 0 public DTO excludes direct identity fields (for example `displayName`, `locationRegion`).
- Layer 0 data is intentionally atmosphere-first: `glimpses`, reflection context, and non-identifying energy descriptors.
- Identity progression occurs after reciprocal intent pathways; discovery is not profile browsing.
- Public discovery DTO omits timestamp fields to reduce urgency pressure patterns.

## Run 9.5.1 auth transport update (web MVP)
- Session transport for web is HttpOnly cookie (`lingr_session`) rather than JS-readable bearer storage.
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` in production.
- Canonical auth semantics remain: expired session = `auth.session_expired`; missing/revoked = `auth.requires_auth`.
- Deferred mobile strategy: native secure-storage bearer flow is post-MVP and documented only.

## Run 9.5.1 Layer 0 discovery conformance
- Layer 0 discovery DTOs (API + mock transport) must not include direct identity (`name`, `displayName`), exact/region location, timestamps, or activity/urgency metadata.


## Run 10 Layers policy (MVP)
- Layer ownership is per relationship pair, not global profile state.
- Layer 0 remains anonymous-first and unchanged.
- Reveal progression policy:
  - Layer 0: anonymous introduction only.
  - Layer 1: first name + broad area (optional) + more context.
  - Layer 2: additional profile details + selected interests/preferences.
  - Layer 3: fuller profile/emotional context.
- Unlock thresholds remain server-internal to preserve calm pacing and avoid pressure UX.


## Run 10.1 progressive profile reveal (implemented)
- Server-authoritative resolver: `getVisibleProfileForRelationship(viewerUserId, targetUserId)`.
- Relationship layer is now the single source of truth for profile field visibility across relationship surfaces.
- Reveal matrix (MVP):
  - Layer 0: glimpses + reflection text + emotional tone + energy tags only.
  - Layer 1: first name + broad region + short intro + selected glimpse context.
  - Layer 2: expanded interests/preferences + more personal glimpse context.
  - Layer 3: fuller profile projection + richer emotional context.
- Hidden state behavior remains calm and non-gamified (e.g., “You'll discover more with time.”).
- Frontend must consume projected profile visibility payloads and must not invent visibility logic.

## Run 10.2 Layers UI integration contract notes
- Discovery contract remains strict Layer 0 projection and must not include identity, location, timestamp, or activity metadata.
- Conversation `layer_unlock` messages are informational system moments; optional CTA routes are only rendered when actionable.
- Profile projections continue to be relationship-layer scoped and must preserve calm hidden-state placeholders.
- Frontend localization requirement: all newly introduced layer copy must exist in both `en` and `nb-NO` translation packs.
- Accessibility requirement: hidden-state messaging must be semantic text (non-link, non-button) unless an actual route action exists.

## Run 10.5 stabilization cleanup (implemented)
- Layer progression anti-gaming guardrails stay lightweight and invisible:
  - reciprocal turn required
  - minimum message quality heuristic (short/low-effort messages are ignored)
  - minimum pacing between counted turns
  - minimum relationship age before Layer 2/3 unlock eligibility
- Progressive reveal now uses structured profile reveal fields rather than text parsing:
  - `broadRegion` (intentional, non-derived broad location label)
  - `revealInterests` (array)
  - `revealEmotionalValues` (array)
- Region reveal policy remains explicit:
  - Layer 0: none
  - Layer 1: `broadRegion` only
  - Layer 3: `locationRegion` exact field
- Timestamp philosophy guardrail: default user-facing discovery/chat rendering paths must not show timestamps.

## Run 11.6 trust-based layer progression direction
Layer progression is no longer modeled as reciprocal message volume plus simple time thresholds.
MVP progression now combines:
- minimum elapsed time
- internal relationship trust score

The trust score is server-internal only and must never be user-visible.

### Planned relationship layer state shape
`relationship_layers` (pair-scoped):
- `currentLayer`
- `trustScore`
- `layer1UnlockedAt`
- `layer2UnlockedAt`
- `layer3UnlockedAt`

### Planned layer rule shape
`layer_rules`:
- `fromLayer`
- `toLayer`
- `minElapsedMinutes`
- `requiredTrustScore`
- `enabled`

MVP defaults:
- Layer 1 -> Layer 2: `minElapsedMinutes = 240`, `requiredTrustScore = 20`
- Layer 2 -> Layer 3: `minElapsedMinutes = 960`, `requiredTrustScore = 55`

### Planned trust signal rule shape
`trust_signal_rules`:
- `signalType`
- `points`
- `enabled`

MVP signal defaults:
- `quality_message_turn`: `2`
- `match_cards_completed`: `8`
- `guess_me_completed`: `6`
- `snuggle_shared`: `5`
- `playing_now_shared`: `2`

MVP excludes cooldowns, daily caps, and anti-farming complexity.

### Future admin tuning direction (deferred)
Rule values should be persisted/configurable for future admin control-panel editing:
- required trust score per layer transition
- minimum elapsed minutes per layer transition
- points per trust signal type
- enabled/disabled status for layer/trust rules

No admin UI is included in MVP.


## Run 11 chat apps foundation
- Chat apps are conversation helpers, not winner/loser games or retention loops.
- Canonical app IDs: `match_cards`, `guess_me`, `snuggle`, `playing_now`.
- App lifecycle (MVP): `invite -> accept -> active -> complete` with optional `dismissed`.
- Persistence ownership: app sessions are relationship-scoped through conversation ownership and must not leak globally.
- Forbidden mechanics: streaks, scores, timers, reminders, badges, leaderboards, urgency prompts, reward loops.

## Run 11.1 Match Cards MVP
- Match Cards remains a calm conversation helper, not a game mechanic.
- Lifecycle (single-question session): `invite -> accepted -> question_active -> both_answered -> revealed -> complete`.
- Persistence is conversation-scoped via `AppSession` + `MatchCardsSession`:
  - selected question (`questionId`, `questionPromptKey`, `questionTone`)
  - per-person answers (`answerByInviter`, `answerByInvitee`)
  - reveal semantics (`revealState`: `hidden|revealed`)
  - completion state (`completed` boolean)
- Reveal policy is strict reciprocal reveal: answers are shown only after both participants have answered.
- No global profile stats, rankings, compatibility scoring, or cross-conversation aggregation.

## Run 11.2 Guess Me MVP
- Guess Me is a conversation helper, not a quiz or compatibility score.
- Lifecycle (single-prompt session): `invite -> accepted -> prompt_active -> both_submitted -> both_guessed -> revealed -> complete`.
- Persistence is relationship-scoped via `AppSession` + `GuessMeSession`:
  - selected prompt (`promptId`, `promptKey`, `optionKeys`)
  - own answers (`ownAnswerByInviter`, `ownAnswerByInvitee`)
  - partner guesses (`guessByInviter`, `guessByInvitee`)
  - reveal semantics (`revealState`: `hidden|revealed`)
  - completion flag (`completed`)
- Reveal policy is reciprocal only: no unilateral reveal before both participants submit answer + guess.
- Forbidden mechanics: points, score, winner/loser framing, rankings, streaks, timers, reminders, compatibility scoring.

## Run 11.3 Snuggle MVP
- Snuggle is a consent-first shared-presence app, not a game or retention mechanic.
- Lifecycle (MVP): `invite -> accepted -> active_shared_hold -> complete` with optional decline via completion path.
- Persistence is relationship-scoped via `AppSession` + `SnuggleSession`:
  - hold state (`holdByInviter`, `holdByInvitee`)
  - shared-presence state (`sharedMomentState`: `quiet|together|passed`)
  - completion semantics (`completionReason`: `moment_passed`)
  - completion flag (`completed`)
- Shared moment appears only when both people are actively holding.
- Neutral ending language only; no blame framing and no presence leakage.
- Forbidden mechanics: timers, scores, streaks, reminders, online/last-seen/seen-state, or profile stats.


## Run 11.5 cleanup updates
- `SnuggleSession` is a persisted table linked 1:1 to `AppSession`.
- Chat Apps lifecycle uses explicit invite/active/dismissed/complete transitions.
- Snuggle state remains neutral and aggregate-only (`quiet`, `together`, `passed`).

## Run 11.6 trust foundation persistence (Prompt 2 implemented)
- `relationship_layers` now persists `trustScore` (`Int`, default `0`) while preserving existing reciprocal-turn fields for migration-safe coexistence until unlock-logic replacement.
- New configurable transition rules persistence via `layer_rules`:
  - `fromLayer`, `toLayer`, `minElapsedMinutes`, `requiredTrustScore`, `enabled`, timestamps.
- New configurable trust-signal persistence via `trust_signal_rules`:
  - `signalType`, `points`, `enabled`, timestamps.
- Canonical trust signal contract values:
  - `quality_message_turn`
  - `match_cards_completed`
  - `guess_me_completed`
  - `snuggle_shared`
  - `playing_now_shared`
- Bootstrap defaults (idempotent upsert on API boot):
  - Layer 1 -> 2: `240` minutes, trust `20`
  - Layer 2 -> 3: `960` minutes, trust `55`
  - Signal points: `2/8/6/5/2` per canonical order above.
- Philosophy guardrail remains unchanged: trust scoring is strictly internal and must not appear in user-facing UI, copy, progress bars, or urgency framing.

## Run 11.6 Prompt 3 implementation notes (trust logic live)
- Layer unlock evaluation now reads from `layer_rules` in runtime service logic.
- Trust accumulation for conversation turns now reads from `trust_signal_rules` using `quality_message_turn` only in this phase.
- A message turn contributes trust only when all existing anti-gaming checks pass:
  - reciprocal alternation
  - minimum quality heuristic
  - pacing guard
- Layer transition requires both conditions:
  - minimum elapsed minutes from `layer1UnlockedAt`
  - required trust score
- Progress remains invisible: trust score and thresholds are server-internal and not exposed in user-facing UI.


## Run 11.6 Prompt 4 trust signals
- Relationship-investment signals are emitted for meaningful app completion moments only (Match Cards reveal, Guess Me reveal, first shared Snuggle together moment, Playing now share).
- Signals are internal and invisible; there is no score UI or progression copy.
- Signal points are DB-configured via `trust_signal_rules`, and trust remains relationship-scoped.

## Run 11.6.1 cleanup notes
- Trust score increments are now applied atomically in transactions (`increment`) to avoid lost updates under near-simultaneous trust signals.
- Layer unlock transitions are guarded with conditional update semantics so only one transaction can perform a given layer transition, preventing duplicate unlock messages.
- Per-layer elapsed anchors are explicit:
  - Layer 1 -> 2 checks elapsed time from `layer1UnlockedAt`.
  - Layer 2 -> 3 checks elapsed time from `layer2UnlockedAt`.
- Message-turn trust pacing minimum is now `60` seconds between counted reciprocal turns.
- Rule safety guardrails:
  - Ignore invalid runtime rules/signals (negative points, negative thresholds/minutes, invalid layer jumps).
  - Keep trust/layer progression resilient if DB config contains invalid entries.

## Run 11.7 session token hashing security update
- `sessions.tokenHash` remains the persisted token identity field, but token hashing strategy is now HMAC-SHA256 with a server-side secret.
- Why this changed: plain SHA-256 hashing was deterministic and not keyed, which weakens protection against offline token-guessing workflows.
- `LINGR_SESSION_SECRET` is required in production; non-production environments may use a controlled fallback secret for local stability.
- Migration implication: existing pre-Run-11.7 sessions may not validate and can require re-login; no schema change or destructive migration is needed.

## Run 11.6 Prompt 4 — relationship investment trust signals (implemented)
- Trust accumulation integrates relationship investment moments from Chat Apps using canonical signals:
  - `match_cards_completed`
  - `guess_me_completed`
  - `snuggle_shared`
  - `playing_now_shared`
- Points are never hardcoded in app logic; values come from `trust_signal_rules` only.
- Trigger semantics are completion-scoped, not activity-scoped:
  - Match Cards trust applies only on reciprocal reveal completion.
  - Guess Me trust applies only when both own-answer + partner-guess fields are complete and reveal unlocks.
  - Snuggle trust applies once per session on first mutual shared moment.
  - Playing now trust applies only on meaningful share payloads.
- Idempotency semantics are required so repeated actions cannot accidentally mint trust in the same session.
- Trust remains strictly pair-scoped in `relationship_layers` and never globalized to user profile totals.

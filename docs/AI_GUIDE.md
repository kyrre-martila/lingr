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
- quiet actions and low-pressure copy (`Spark`, `Not now`)
- warm empty/loading/unavailable states

Avoid:
- swipe-stack framing
- gamified counters or urgency language
- celebratory “match” mechanics for spark success


## Region rollout foundation (implemented)
- Canonical models: `Country` (ISO + enabled), `Region` (country-linked slug/name), `RegionInterestVote` (email waitlist + vote signal).
- Launch lifecycle: `closed`, `waitlist`, `open`, `paused`.
- API contracts: `GET /v1/regions/countries`, `GET /v1/regions/:countryCode`, `GET /v1/regions/check`, `POST /v1/regions/vote`.
- Reason codes: `region.closed`, `region.waitlist`, `region.open`, `region.invalid`.
- Controlled density intent: this is not social-status exclusivity; it is healthy pool rollout sequencing.
- Localization constraint: names and UI copy are key-driven and locale-ready (`en` canonical, `nb-NO` launch pack).

## Localization implementation guardrail (Run 9 foundation)
- Web UI must reference translation keys from namespace packs in `apps/web/src/i18n/*`.
- Do not localize backend contracts or reason codes.
- High-touch surfaces migrate first; full migration is intentionally deferred.

## Marketing website foundation policy (`lingr.dating`)
Purpose at MVP stage:
- explain Lingr clearly and calmly
- communicate philosophy (slow, intentional, emotionally safe)
- collect waitlist interest and region voting signals
- support soft region-by-region momentum

Guardrails:
- This is not a hype funnel or urgency machine.
- Avoid manipulative scarcity copy or pressure CTAs.
- Use warm, reflective language and low-pressure pacing.
- Keep implementation simple, fast, and localization-ready (`en`, `nb-NO`).

Required MVP sections:
- Hero with calm positioning + region CTA
- What Lingr is (slow dating and safety principles)
- How Lingr works (Glimps → Sparks → Layers → Conversation)
- Region rollout rationale
- Region voting/waitlist form connected to API contracts
- Placeholder preview area until final assets are ready

## Run 9 implementation extension
- Registration must be region-gated **before** account creation.
- Closed/waitlist regions should never feel like rejection; use warm language and waitlist-notify CTA.
- Marketing-to-app handoff should preserve selected region in MVP (query param/local storage/session transfer acceptable).
- Discovery must stay region-scoped with no cross-region leakage for MVP.

## Auth implementation guardrail (Run 9.5)
- Production-safe MVP auth must use Prisma persistence, not process memory.
- Password hashing must use bcrypt with minimum 12 rounds.
- Auth payloads must remain minimal and never expose password hashes or internal auth material.
- Session lifecycle must remain status-driven (`active`, `expired`, `revoked`) with explicit expiry behavior.

## Run 9.5 philosophy hardening notes (May 19, 2026)
- Layer 0 discovery is anonymous-first: no names or region labels in discovery introductions.
- Layer 0 payloads prioritize Glimps, reflection text, tone, and energy signals.
- Discovery is an introduction moment, not profile browsing; avoid marketplace language.
- CTA vocabulary stays calm: `Spark` and `Not now`.
- Public discovery DTOs should not expose timestamps unless absolutely required for product function.

## Run 9.5.1 pre-Run-10 hardening (May 19, 2026)
- Web auth transport uses HttpOnly session cookie (`lingr_session`) as MVP default; web runtime must not store session tokens in `localStorage`.
- Cookie policy: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in production.
- Auth failures remain canonical: expired session → `auth.session_expired`; missing/revoked session → `auth.requires_auth`.
- Mobile auth is deferred: future native apps may use secure native storage + bearer token flow, but this is not implemented in web MVP.
- Layer 0 conformance: discovery payloads (API and web mocks) must exclude name, location, timestamps, and activity/urgency metadata.

## Run 10 implementation guardrail — Layers
- Layers are trust progression, not reward mechanics.
- Pair-specific layer state is server-authoritative and never globalized across all relationships.
- Internal thresholds may unlock deeper layers, but UI must stay gentle and non-urgent.
- Unlock communication should be subtle timeline system copy.

## Run 11.6 layer trust progression guardrail
Layer progression must be modeled as trust + time, not message-count farming.

MVP rules:
- Layer 1 is created by mutual Spark.
- Layer 1 -> Layer 2 requires minimum 4 hours elapsed and trust score >= 20.
- Layer 2 -> Layer 3 requires minimum 16 hours elapsed and trust score >= 55.

MVP trust signals:
- `quality_message_turn`: +2
- `match_cards_completed`: +8
- `guess_me_completed`: +6
- `snuggle_shared`: +5
- `playing_now_shared`: +2

Trust score policy:
- trust score is strictly internal and never shown to users
- users should experience unfolding, not optimization targets
- no user-facing progress math, percentages, XP, or point requirements

MVP exclusions:
- cooldown rules
- daily caps
- anti-farming complexity
- admin UI

Future direction (deferred):
- persist/configure layer rules and trust-signal rules so admin controls can tune thresholds and points later.

Forbidden progression framing in copy/UI:
- progress bars
- score displays
- “you need X more points”
- streaks
- farming language
- “complete actions to unlock” tasks
- urgency mechanics


## Run 10.1 visibility philosophy
- People unfold slowly: curiosity first, identity later, trust gradually.
- Profile field reveal policy is backend authoritative via relationship-layer visibility resolver.
- Frontend is a renderer of projected visibility state, not a decision-maker of what is hidden/revealed.
- Hidden states should feel calm and human, never punitive or gamified.

## Run 10.2 Layers in active surfaces
When integrating Layers into discovery/chat/profile, keep visibility subtle and calm.

Required integration behavior:
- Discovery is always Layer 0 and anonymous-first.
- Chat may include subtle `layer_unlock` system messages.
- Profile surfaces must be relationship-layer aware and render calm placeholders for hidden fields.

Forbidden layer UI patterns:
- lock/padlock-heavy framing
- gamified progression framing
- pressure copy (“send more”, countdowns, quotas, or next-layer timers)

Localization and accessibility:
- New copy must use translation keys and ship in `en` + `nb-NO`.
- Hidden state communication must be explicit for screen readers and non-interactive unless actionable routes exist.

## Run 10.3 emotional tone guardrails — Layers polish
- Layer unlock moments must feel warm, gentle, and slightly meaningful; never dramatic.
- Prefer language like: “You have come to know a little more about them.” / “Something new is now visible.”
- Hidden profile states should invite curiosity without frustration (example: “Getting to know someone takes time.”).

Forbidden Layer framing:
- reward framing (`reward`, `bonus`, `achievement`, `congratulations`)
- game framing (`XP`, `level up`, `streak`, `badge`, progress percentages)
- pressure framing (`next layer in`, quotas, countdowns, urgency prompts)
- paywall framing (`upgrade`, `premium unlock`, `unavailable until`)

Accessibility and truthfulness constraints:
- `layer_unlock` is always system-authored (`senderUserId = null`).
- CTA text should be interactive only when a real route exists.
- If no route exists, render informational copy only (no fake links/buttons).

## Run 10.5 stabilization guardrails
- Keep progression simple and calm; do not add meaningfulness scoring, quotas, countdowns, or pressure mechanics.
- Count only reciprocal, minimally substantive turns with light pacing checks.
- Use explicit structured reveal fields for interests/values/region broadness; do not parse free-text summary fields for reveal state.
- Keep default user-facing layer/discovery/chat surfaces timestamp-free.


## Run 11 chat apps foundation
- Chat apps are conversation helpers, not winner/loser games or retention loops.
- Canonical app IDs: `match_cards`, `guess_me`, `snuggle`, `playing_now`.
- App lifecycle (MVP): `invite -> accept -> active -> complete` with optional `dismissed`.
- Persistence ownership: app sessions are relationship-scoped through conversation ownership and must not leak globally.
- Forbidden mechanics: streaks, scores, timers, reminders, badges, leaderboards, urgency prompts, reward loops.

## Run 11.1 Match Cards philosophy and guardrails
Match Cards is a calm intimacy helper inside chat.

Required behavior:
- one person starts Match Cards
- exactly one thoughtful question in MVP
- both answer privately
- reveal only after both have answered

Question design rules:
- favor gentle emotional curiosity
- allow reflective but low-pressure responses
- keep prompts safe for early trust

Forbidden prompt styles:
- therapy/diagnostic framing
- trauma-mining questions
- sexual prompts
- hyper-romantic pressure prompts
- dating-app cliché adversarial prompts (e.g., “red flags”)

Implementation anti-patterns to avoid:
- scores, winners, best-answer systems
- timers/reminders/streak loops
- unilateral reveal or “seen” pressure mechanics

## Run 11.2 Guess Me philosophy and guardrails
Guess Me helps two people discover small surprising preferences in a gentle way.

Required behavior:
- one person starts Guess Me
- one prompt only in MVP
- each person picks their own answer privately
- each person guesses what the other chose
- reveal happens only after both have provided answer + guess

Prompt design rules:
- exactly 4 options per prompt
- light, safe, low-pressure, early-trust friendly
- no sexual prompts
- no trauma-mining or therapy prompts
- no red-flag/interrogation framing
- no judgment-heavy framing

Reveal semantics:
- pre-reveal: only self answer + self guess visible
- post-reveal: both real answers + both guesses visible
- keep copy warm and conversation-oriented

Forbidden mechanics:
- score/points/winner/loser/correctness framing
- timers, streaks, rankings, percentages, rewards
- compatibility scoring or profile-level aggregation

## Run 11.3 Snuggle philosophy and guardrails
Snuggle is a tiny shared presence moment inside chat.

Required behavior:
- invitation is explicit and opt-in
- nothing activates without acceptance
- both can softly hold; shared state appears only when both are present
- either person can stop naturally with neutral ending language

Presence semantics:
- Snuggle reflects in-session mutual presence only
- it must not expose online status, seen state, last active, or activity traces

Forbidden mechanics:
- dopamine loops (scores, streaks, rankings, reminders)
- timers/countdowns/duration pressure
- guilt or blame framing (for example "they left" or "you missed it")


## Run 11.5 cleanup updates
- Keep Snuggle copy neutral and aggregate-only; avoid partner-presence phrasing.
- Do not use completion as a proxy for decline; use dismiss/decline semantics.
- Reveal states for Match Cards and Guess Me must wait for both participants to submit required input.

## Run 11.6 Prompt 2 implementation note (trust persistence foundation)
- Additive persistence foundation is now in place for trust-based progression tuning:
  - `relationship_layers.trustScore` (default `0`)
  - `layer_rules` config table (`fromLayer`, `toLayer`, `minElapsedMinutes`, `requiredTrustScore`, `enabled`)
  - `trust_signal_rules` config table (`signalType`, `points`, `enabled`)
- Canonical trust signals are centralized contract constants and must be reused (no ad-hoc string duplication).
- MVP defaults are bootstrapped idempotently at API startup (upsert-only, non-destructive):
  - Layer 1 -> 2: 240 minutes + trust 20
  - Layer 2 -> 3: 960 minutes + trust 55
  - Signals: quality message turn 2, match cards completed 8, guess me completed 6, snuggle shared 5, playing now shared 2.
- This run does **not** change active unlock logic yet:
  - reciprocal-turn progression remains temporarily in place
  - trust scoring accumulation behavior is deferred to Prompt 3
- Invisible scoring philosophy remains mandatory:
  - never expose trust score, points, or progress math to users
  - never add progress bars, XP framing, or urgency mechanics.

## Run 11.6 Prompt 3 implementation guardrail (trust logic live)
- Layer progression logic is now DB-config driven (no hardcoded unlock thresholds in service logic).
- Runtime unlock checks must always require both time + trust conditions from `layer_rules`.
- Runtime trust accumulation for this phase is limited to `quality_message_turn` from reciprocal, quality, paced turns.
- Trust points must always come from `trust_signal_rules` and remain fully invisible to users.
- Preserve subtle unlock tone in system messages; never reveal score math or progress state.


## Run 11.6 Prompt 4 trust accumulation
- Chat apps contribute to trust only on meaningful completions, not opens/invites/partials.
- Layer unlocks still require both elapsed-time and trust thresholds; app signals only contribute trust.
- Idempotent semantics: one reward per completion event/session transition.

## Run 11.6.1 cleanup guardrails (stabilization before Run 12)
- Concurrency safety: trust accumulation must use atomic increments inside transactions; avoid read-modify-write trust updates.
- Duplicate unlock prevention: layer transition writes should be conditional so near-simultaneous signals cannot emit repeated unlock system messages.
- Elapsed-time semantics are per transition anchor:
  - 1 -> 2 uses `layer1UnlockedAt`.
  - 2 -> 3 uses `layer2UnlockedAt`.
- Message-turn pacing floor for counted trust turns is `60s` (not 20s).
- Config validation must reject or safely ignore negative trust points, negative required scores, negative elapsed minutes, and invalid from/to layer combinations.
- Deferred by design: no visible trust UI, no analytics dashboards, no anti-farming complexity beyond simple pacing and quality checks.

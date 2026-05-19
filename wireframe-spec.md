# Lingr — Wireframe Spec (Run 9 Direction Alignment)

## Primary chat screen
Default chat is a normal, clean message interface with subtle Lingr palette styling.

Required visible elements:
- Header with participant name and standard navigation/actions
- Message stream with calm spacing and rounded bubbles
- Composer area at bottom
- **+** button at bottom-left of composer

## Pressure-free interaction rules
The chat wireframe must not show:
- online presence
- typing indicators
- read receipts
- last seen
- per-message timestamps
- urgency cues
- streak indicators
- any engagement-loop mechanics

## Plus menu structure
Tapping **+** opens root sheet with:
1. Apps
2. Playing now

### Apps submenu
- Match Cards
- Guess Me
- Snuggle

### Playing now submenu
- Song
- Movie
- TV Series

These are optional apps inside chat and should not be positioned as gamification.

## System moments in timeline
Chat timeline supports subtle system rows for:
- layer unlock events
- app invites
- playing now shares

System rows should be informative and gentle, never urgency-driven.

## Layer progression UX philosophy (Run 11.6)
Layer progression is internal trust progression, not a visible game loop.

Required UX behavior:
- users should feel that “something naturally unfolded”
- unlock pacing should be subtle and emotionally calm
- no explicit score/progress instrumentation appears in UI

Progression logic remains server-authoritative and combines minimum elapsed time + internal trust score.

Forbidden layer/progression UI patterns:
- progress bars
- score displays
- “you need X more points” copy
- XP language
- streak mechanics
- layer farming language
- “complete actions to unlock” task framing
- urgency mechanics (countdowns, timers, pressure prompts)

## Window placement in journey
Window is removed from early chat framing.

Window should be presented only after progression signals:
1. meaningful chat established
2. Sparks progression exists
3. multiple Glimps exist
4. Layer unlock progression reached
5. optional Window stage appears

## Region launch wireframe dependencies
Onboarding/registration wireframes should include:
- country selection
- county/state/region selection
- open-region continue path
- closed-region vote + waitlist path
- email notification expectation state

This supports density-first local launch, not global day-one availability.

## Discovery MVP screen (Run 9)
- One introduction shown at a time (no stack, no swipe).
- Daily cap visible as calm pacing copy (e.g. “2 of 3 remaining”).
- Primary content order: Glimps snippets, emotional rhythm hints, reflective prompt cues.
- Quiet actions only:
  - `Pass quietly`
  - `Spark`
- Calm empty states:
  - limit reached: “You’ve explored today’s introductions.”
  - no available people: “Nothing new for now. Some connections are worth waiting for.”
- No urgency UI: no countdowns, no red badges, no engagement prompts.

## Discovery MVP (Run 9)

- Discovery now uses live service integration (`discovery.get`) and renders one introduction at a time in a calm editorial layout.
- States implemented: loading, empty, daily limit reached, unavailable region, onboarding required, profile incomplete.
- Spark action uses real API call (`spark.create`) and confirms softly with a subtle confirmation state.
- Pass action is intentionally quiet and advances pacing without swipe/card metaphors.
- Daily pacing avoids countdown timers and urgency framing.
- Discovery progress persists across refresh with backend data + lightweight client dismissal memory.
- Recommendation engine ranking and deeper personalization remain deferred.

## Run 9 calm interaction vocabulary update
- Discovery action labels are now:
  - `Spark`
  - `Not now`
- `Not now` is framed as temporary pacing, never as permanent rejection.
- Discovery states include loading, unavailable region, daily limit reached, empty, and subtle spark confirmation.
- Do not display remaining counters, timers, urgency prompts, or online indicators in discovery.

## Discovery editorial polish principles (Run 9)
- Discovery is an **introduction**, not a profile browsing feed.
- Show one person at a time with spacious, low-contrast, calm composition.
- Prioritize Glimps first (moment, reflection, emotional tone), then supporting context.
- Action language stays gentle: `Spark` and `Not now` only.
- Empty and unavailable states should feel warm and open-ended, never punitive.
- Region unavailable copy: “Lingr has not opened in your area yet.” with a soft waitlist/vote placeholder CTA.
- Spark success is subtle and quiet: no confetti, no “match” celebration patterns.

### Discovery visual anti-patterns to avoid
- Swipe-stack/card deck metaphors.
- “Hot profile card” visual hierarchy.
- Gamified counters/timers/urgency banners.
- Optimization copy (“more profiles”, “out of likes”, “daily limit reached”).


## Region rollout foundation (implemented)
- Canonical models: `Country` (ISO + enabled), `Region` (country-linked slug/name), `RegionInterestVote` (email waitlist + vote signal).
- Launch lifecycle: `closed`, `waitlist`, `open`, `paused`.
- API contracts: `GET /v1/regions/countries`, `GET /v1/regions/:countryCode`, `GET /v1/regions/check`, `POST /v1/regions/vote`.
- Reason codes: `region.closed`, `region.waitlist`, `region.open`, `region.invalid`.
- Controlled density intent: this is not social-status exclusivity; it is healthy pool rollout sequencing.
- Localization constraint: names and UI copy are key-driven and locale-ready (`en` canonical, `nb-NO` launch pack).

## Localization wireframe baseline (Run 9 foundation)
- High-touch onboarding/discovery/chat frames must bind all visible UI copy to translation keys.
- Screen-reader labels and keyboard controls must remain semantically stable across locales.
- Region selection UI must remain locale-ready without English-only assumptions.

## Registration entry wireframe (implemented direction)
1. Choose country
2. Choose region/state/county
3. Availability check
4. Branch:
   - open: continue registration form
   - closed/waitlist: warm unavailable copy + notify CTA

Copy tone should be guided/calm/intentional, never punitive.

## Layer 0 philosophy hardening (Run 9.5)
- Discovery cards should read as quiet introductions, not profile marketplace tiles.
- Do not render personal names or region labels at Layer 0.
- Primary action label is `Spark` (not transactional variants).
- Empty-state language must remain calm and non-urgent.

## Run 10 wireframe policy — Layers
- Layer unlock moments should render as subtle system rows in chat.
- Tone example: "You've come to know a little more about them."
- Do not use celebratory or gamified UI (no level-up language, no confetti, no bars, no percentages).
- Layer 0 anonymity remains mandatory in discovery and intro surfaces.


## Run 10.1 layer-aware profile rendering
- Profile, chat header/context cards, and conversation list surfaces must render from backend visibility projection, not local reveal logic.
- Hidden fields should render calm placeholders (example: “You'll discover more with time.”).
- Avoid lock/premium/game metaphors; no padlock, no progress bars, no reveal percentages.
- Same relationship must render same visible state across discovery/chat/profile/conversation surfaces.

## Run 10.2 UI integration — Discovery/Chat/Profile
- Discovery remains Layer 0 and anonymous-first on every introduction surface.
- Discovery cards may show: Glimps reflection, tone context, energy tags, and optional calm curiosity hints (example: “More can unfold later.”).
- Discovery cards must never show: personal name, exact or broad location, full profile payload, timestamps, activity signals, or urgency hints.
- Conversation surfaces may show subtle relationship-layer context and calm system rows for `layer_unlock`.
- Layer unlock rows can include a profile CTA only when an actionable route exists; otherwise render plain informative text with no link affordance.
- Profile surfaces must render hidden states as calm placeholders (not lock-heavy, not premium/paywall-like, not game-like).

### Forbidden layer UI patterns
- No “Locked” framing.
- No “Unlock profile” callouts.
- No progress bars, quotas, countdowns, XP/streak/badge language, or pressure-to-chat prompts.

### Accessibility and localization rules
- All new user-visible copy must use i18n keys (`en`, `nb-NO`).
- Hidden sections must expose clear non-interactive text indicating intentional unavailability.
- Do not style hidden placeholders as interactive controls.

## Run 10.3 emotional polish and consistency
- Layer unlock rows should read as calm system moments, not milestones.
- Keep visual treatment subtle and timeline-native; no celebration effects.
- Example unlock microcopy:
  - “You have come to know a little more about them.”
  - “Something new is now visible.”
  - “See a little more” (only when route is actionable)
- Example hidden-state microcopy:
  - “Getting to know someone takes time.”
  - “Some things unfold naturally.”

### Anti-gamification conformance checks
Layer UI must not include:
- progress percentages or bars
- XP, streak, badge, achievement language
- reward framing or congratulatory framing
- urgency/counter/quota framing

### Accessibility conformance
- System rows should remain screen-reader legible as informative content.
- Hidden placeholders must be non-interactive text.
- CTA affordance must match real navigation availability.

## Run 10.5 wireframe conformance notes
- Layer progression remains invisible and non-instrumentalized to users (no “X messages away” framing).
- Layer 1 reveals intentional broad region field only; no string-derived location slicing behavior.
- Discovery/chat default rendering remains timestamp-free.


## Run 11 chat apps foundation
- Chat apps are conversation helpers, not winner/loser games or retention loops.
- Canonical app IDs: `match_cards`, `guess_me`, `snuggle`, `playing_now`.
- App lifecycle (MVP): `invite -> accept -> active -> complete` with optional `dismissed`.
- Persistence ownership: app sessions are relationship-scoped through conversation ownership and must not leak globally.
- Forbidden mechanics: streaks, scores, timers, reminders, badges, leaderboards, urgency prompts, reward loops.

## Run 11.1 Match Cards MVP wireframe notes
- Timeline includes subtle system rows (example: “Maja started Match Cards.”).
- One thoughtful prompt appears per session (no category browser, no multi-round flow).
- Before reciprocal completion, show a soft waiting line (example: “Your answer is here when they’re ready.”).
- Reveal treatment is editorial and warm; avoid quiz/trivia visuals and winner/loser framing.
- No pressure mechanics: no seen states, timers, reminders, or “waiting on them” urgency cues.

## Run 11.2 Guess Me MVP wireframe notes
- Timeline starts with a subtle system row (example: “Maja started Guess Me.”).
- A single warm prompt with exactly four options appears for both people.
- Input order is calm and private: choose your own answer, then guess your partner answer.
- Before reveal, show only the viewer's own answer and own guess.
- Reveal occurs only when both people completed both inputs.
- Reveal tone remains editorial and warm (example: “You guessed each other surprisingly well.” / “You saw this one differently.”).
- Waiting copy must be low-pressure (example: “Your part is saved. The rest can wait.”).
- Forbidden UI mechanics: points, winner badges, correctness markers, countdowns, urgency language, leaderboards.

## Run 11.3 Snuggle MVP wireframe notes
- Timeline starts with subtle invitation row (example: "Maja invited you to Snuggle.").
- Invitation must provide explicit consent controls: `Join` and `Decline`.
- Active Snuggle uses accessible, low-precision "Hold gently" controls.
- Shared state copy remains gentle:
  - together: "You're here together."
  - quiet: "A small quiet moment."
  - end: "That moment passed."
- End states must never frame abandonment or absence as blame.
- Forbidden UI mechanics: timers, durations, scores, streaks, reminders, online indicators, activity tracking.


## Run 11.5 cleanup updates
- Added route-level Chat Apps endpoints for invite, accept, dismiss, complete, and app interaction actions.
- Invalid lifecycle transitions are rejected with conflict semantics.

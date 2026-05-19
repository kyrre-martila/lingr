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

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
  - `Send Spark`
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

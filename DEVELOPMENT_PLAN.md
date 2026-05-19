# Lingr — Development Plan (Revised Run 9 Alignment)

## Purpose
This plan keeps Lingr focused on a practical MVP path to calm, safe, region-by-region launch.

Scope of this document:
- reflect current product direction and what is already stabilized
- define remaining MVP work without scope creep
- protect calm-chat principles in implementation decisions
- keep launch execution practical and density-first

---

## Current Product Direction (Non-negotiable)

Lingr is:
- slow
- intentional
- calm
- emotionally safe
- anti-pressure
- anti-swipe
- anti-dopamine optimization

**Philosophy must exist in code, not only in copy.**

Never include:
- online status
- typing indicators
- read receipts
- last seen
- per-message timestamps
- urgency mechanics
- streaks
- engagement loops

---

## Stabilized Product Decisions

### Chat architecture
- Default chat remains normal-first and low-pressure.
- Composer uses bottom-left `+` menu.
- Root menu:
  - Apps
  - Playing now
- Apps submenu:
  - Match Cards
  - Guess Me
  - Snuggle
- Playing now submenu:
  - Song
  - Movie
  - TV Series

Apps are optional activities inside chat, not gamification mechanics.

### Relationship progression
Window is explicitly later in progression. Window unlock should only happen after:
- meaningful chat
- Sparks
- multiple Glimps
- Layer unlock progression

### Auth strategy (MVP)
MVP auth is Lingr-native only:
- email/password
- session persistence
- onboarding gating
- profile completion gating

Deferred until post-MVP:
- Apple Sign In
- Google Sign In
- passwordless auth
- account linking

### Localization foundation
- Canonical source language: English (`en`)
- Launch-ready language: Norwegian Bokmål (`nb-NO`)
- Translation keys only (no hardcoded UI strings)
- Reason codes remain backend-safe and non-localized
- Frontend localization layer maps keys/reason codes to user-facing strings

### Region launch model
Launch is region-by-region for healthy local dating density.

User flow:
1. Register
2. Choose country
3. Choose county/state/region
4. If region is open → continue registration
5. If region is closed → vote for region + join waitlist + email notify later

Domain model:
- Marketing website: `lingr.dating`
- Web app: `app.lingr.dating`
- API: `api.lingr.dating`
- Future: `cdn.lingr.dating`, `admin.lingr.dating`

---

## Go-to-Market Strategy (MVP)
No global big-bang launch.

Launch approach:
- slow rollout
- one region at a time
- weekly openings
- waitlist-driven priority
- social hype loops (non-addictive, event-based)
- email reactivation

Potential early sequence (illustrative):
- Trøndelag
- Troms
- Bergen
- Oslo later

Final order is decided by waitlist demand and regional signals.

**Data > assumptions.**

---

## Updated MVP Roadmap

## Run 8.5 — Auth hardening
Goal: lock auth/session/gating reliability before expanding product surface.

Planned scope:
- finalize Lingr-native email/password reliability
- strengthen session persistence behavior
- tighten onboarding/profile completion gate enforcement
- stabilize auth failure semantics and edge-case handling

Exit criteria:
- auth flow is stable and predictable across register/login/logout/session-expiry
- onboarding/profile gate behavior is enforced consistently

## Run 9 — Discovery MVP
Goal: ship intentional discovery with calm pacing.

Planned scope:
- bounded discovery cadence
- Glimps and Sparks progression clarity
- non-addictive discovery controls

Exit criteria:
- discovery is useful without creating pressure loops

## Run 10 — Layers MVP
Goal: deliver meaningful depth progression logic.

Planned scope:
- layer unlock behavior and constraints
- progression signals for deeper connection readiness
- preconditions that eventually feed Window eligibility

Exit criteria:
- layer progression feels clear, gradual, and earned

## Run 11 — Chat apps MVP
Goal: complete optional apps-inside-chat experience.

Planned scope:
- Match Cards MVP
- Guess Me MVP
- Snuggle MVP
- Playing now card flow consistency

Exit criteria:
- apps are optional and conversational, never required

## Run 12 — Safety/moderation MVP
Goal: establish minimum trust and safety systems.

Planned scope:
- report/block/pause flows
- moderation queue
- safety event logging and review support

Exit criteria:
- users can protect themselves quickly and reliably

## Run 13 — Region launch system
Goal: ship operational region gating, voting, and waitlist.

Planned scope:
- country + county/state/region selection
- open/closed region gating
- vote + waitlist enrollment
- launch-notify email reactivation

Exit criteria:
- region opening workflow is operational and measurable

## Run 14 — Polish
Goal: improve quality and UX consistency.

Planned scope:
- UX polish
- loading/empty/error states
- performance and reliability improvements

## Run 15 — Beta readiness
Goal: verify end-to-end readiness for controlled public usage.

Planned scope:
- bug backlog burn-down
- operational readiness checks
- analytics + launch dashboards

## Run 16 — Soft launch
Goal: begin gradual real-world rollout.

Planned scope:
- first region opens
- weekly region cadence
- waitlist-driven expansion

---

## Post-MVP (Explicitly deferred)
- Apple Sign In
- Google Sign In
- passwordless auth
- account linking
- broad global availability day-one strategy
- engagement mechanics that conflict with calm philosophy

### Run 9 implementation baseline (added)
- Discovery now uses a server-authoritative UTC daily cap contract (`DISCOVERY_LIMIT_PER_DAY`).
- MVP filtering excludes self, blocked users, active Sparks, previously viewed people, and non-active accounts.
- UI baseline moved to one-at-a-time introduction with calm empty states and no swipe/feed mechanics.

### Run 9 discovery-to-spark completion (MVP)
- Discovery card actions are intentionally calm and limited to `Send spark` and `Not now`.
- `Not now` is a soft dismiss, not rejection: it marks the profile as viewed and hides it for a cooldown window.
- MVP cooldown is configurable; current default is **14 days**.
- Discovery spark sends through discovery-specific API flow and avoids duplicate spark creation.


## Region rollout foundation (implemented)
- Canonical models: `Country` (ISO + enabled), `Region` (country-linked slug/name), `RegionInterestVote` (email waitlist + vote signal).
- Launch lifecycle: `closed`, `waitlist`, `open`, `paused`.
- API contracts: `GET /v1/regions/countries`, `GET /v1/regions/:countryCode`, `GET /v1/regions/check`, `POST /v1/regions/vote`.
- Reason codes: `region.closed`, `region.waitlist`, `region.open`, `region.invalid`.
- Controlled density intent: this is not social-status exclusivity; it is healthy pool rollout sequencing.
- Localization constraint: names and UI copy are key-driven and locale-ready (`en` canonical, `nb-NO` launch pack).

### Run 9.1 — Localization foundation (completed)
- Established namespace i18n architecture before broader migration.
- Migrated high-touch active surfaces first (discovery/chat/auth/onboarding error paths).
- Added locale detection + persisted override with `en` fallback.
- Deferred full-screen translation sweep to later runs to avoid scope creep.

## Run 9.2 — Marketing/waitlist site foundation (`lingr.dating`)
Goal: establish a calm pre-launch web presence and collect region demand signals before broad opening.

Delivered baseline:
- Created `apps/site` as lightweight marketing shell (not a full brand site).
- Added structured sections: hero, what Lingr is, how it works, region rollout rationale, waitlist voting, and preview placeholders.
- Connected waitlist voting flow to API region rollout contracts.
- Added localization-ready copy architecture with `en` + `nb-NO` packs.
- Added MVP SEO metadata + OG baseline.
- Added accessibility baseline with keyboard path, semantic structure, live updates, and reduced-motion respect.

Deferred from this run:
- Final production visuals/assets for screenshots.
- CMS/content tooling.
- Full analytics instrumentation and conversion experiments.
- Geo-suggested region preselection.

### Run 9 extension — region-aware registration
- Implement pre-account registration gate: country + region + availability check.
- Closed region path writes waitlist interest and returns warm non-rejection UX.
- Marketing-to-app region context transfer is required in MVP to reduce duplicate entry friction.
- Discovery remains restricted to open launch regions in same-region scope for MVP.

### Run 9.5 — Auth stabilization (completed)
- Replaced prototype in-memory auth/session maps with Prisma persistence.
- Replaced SHA-256 password hashing with bcrypt (12 rounds).
- Session lifecycle now uses DB-backed status transitions: `active`, `expired`, `revoked`.
- Preserved auth API contracts (`register`, `login`, `logout`) and reason-code semantics.

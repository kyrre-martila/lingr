# Lingr — Development Plan (Post Run 7)

## Purpose
This plan keeps Lingr focused on a practical MVP path to beta launch.

Scope of this document:
- reflect what is already implemented
- define what is left for MVP
- protect calm-chat product principles
- keep execution realistic (no speculative platform overengineering)

---

## Current Status

### Completed foundations (Runs 1–7)
The following core foundations are in place:

- Run 1 foundation established.
- Routing/navigation architecture established.
- Domain extraction completed for clearer boundaries.
- Shared contracts introduced and reused across layers.
- API foundation established.
- Auth/session foundation implemented.
- Profile persistence implemented.
- Glimps persistence implemented.
- Spark persistence implemented.
- Calm chat foundation documented and implemented as baseline constraints.
- Message contracts established (`text`, `system`, `layer_unlock`, `playing_now`, `app_invite`).
- Conversation/message persistence implemented.
- Playing now message type implemented.
- Layer unlock system message handling implemented.

### Stabilized areas
These areas are directionally stable and should not be redesigned during MVP completion:

- Calm-chat philosophy constraints (no online/typing/read-receipt/last-seen/per-message-timestamp pressure mechanics).
- Shared contracts as source-of-truth vocabulary for message and conversation types.
- Service-boundary direction (frontend uses service/API boundary rather than direct mock-owned UI logic).
- Conversation/message persistence model and viewer-scoped access direction.
- Window repositioning: later-stage/deeper concept, not early chat.

### Areas that still require fixes/hardening
These are known stabilization gaps to resolve as part of upcoming runs:

- Complete auth onboarding experience (provider sign-ins + fallback + gating).
- Finish discovery pacing behavior and intentional reveal flow.
- Harden conversation/message service edge cases (validation completeness, consistency behavior, and reliability guardrails).
- Complete chat app wiring from menu skeleton to real in-chat optional activity surfaces.
- Add MVP safety/moderation capabilities before beta.
- Improve UX polish, loading/empty/error states, and performance.

---

## MVP Roadmap

## Run 8 — Auth & onboarding completion
Goal: make account creation and first-session entry complete, reliable, and calm.

Planned scope:
- Apple Sign In.
- Google Sign In.
- Magic link fallback.
- Onboarding gating.
- Profile completion flow.
- Push notification foundation.

Exit criteria:
- A new user can reliably create/login to an account with at least one primary provider and fallback path.
- Incomplete onboarding cannot silently bypass required profile steps.
- Notification foundation exists without introducing urgency mechanics.

## Run 9 — Discovery MVP
Goal: ship intentional, limited discovery that supports quality over volume.

Planned scope:
- Limited daily discovery.
- Glimps-first browsing.
- Spark flow refinement.
- Limited profile reveal.
- Basic matching/filtering.
- Pacing-first experience.

Exit criteria:
- Discovery is intentionally bounded and non-addictive by default.
- Glimps/Spark progression is understandable and calm.
- Filtering is basic but useful for MVP.

## Run 10 — Layers & Window v1
Goal: implement gradual deepening mechanics after early chat.

Planned scope:
- Gradual profile unlock.
- Real layer unlock logic.
- Window eligibility.
- Optional deeper connection state.

Clarification:
- **Window is not the early chat experience.**
- **Window is a later-stage, exclusive/deeper connection concept.**

Exit criteria:
- Layer unlock behavior is real (not purely placeholder/system-text only).
- Window eligibility is explicit and understandable.
- Early chat remains calm and normal-first.

## Run 11 — Chat Apps MVP
Goal: add lightweight social activities inside chat without making them required.

Planned scope:
- Match Cards.
- Guess Me.
- Snuggle v1.
- Playing now improvements.

Clarification:
- **Apps are optional activities inside chat.**
- **Apps are not mandatory for conversation.**

Exit criteria:
- Each app can be invoked through the established chat composer flow.
- Core text chat remains first-class and unaffected when apps are unused.

## Run 12 — Safety & Moderation MVP
Goal: establish minimum trust and safety for beta readiness.

Planned scope:
- Report.
- Block.
- Pause.
- Moderation queue.
- Safety events.
- Trust systems.

Exit criteria:
- Users can protect themselves quickly and clearly.
- Moderation signals are reviewable and actionable.
- Safety actions are integrated across relevant surfaces.

## Run 13 — Launch/Beta polish
Goal: raise quality to a stable, coherent beta baseline.

Planned scope:
- Bug fixing.
- Performance improvements.
- Onboarding polish.
- Empty states.
- Loading states.
- Analytics.
- App Store preparation.
- Copy refinement.

Exit criteria:
- End-to-end MVP loops are stable.
- UX quality is consistent across key journeys.
- Beta package is operationally ready.

---

## Design System & Branding Roadmap

Important sequencing:
- Branding and visual polish should progress **after core MVP functionality stabilizes**.
- Foundational visual consistency work can happen in parallel only when it does not slow critical product execution.

### Design system work
- Typography system.
- Spacing scale.
- Card system.
- Message cards.
- System cards.
- Playing now cards.
- Color tokens.

### Branding work
- SVG logo.
- Monochrome variants.
- App icon.
- Horizontal and stacked logo variants.
- Splash assets.

### Visual language target
Lingr visual language should stay:
- warm
- premium
- calm
- Scandinavian-inspired
- soft and emotionally safe
- non-corporate
- non-gamified

### Motion system
- Subtle transitions.
- Calm animations.
- Premium feel.
- Avoid dopamine-heavy interaction patterns.

### Icon system
- Consistent icon family.
- Rounded/soft visual language.

### Illustration system
- Onboarding illustrations.
- Empty-state illustrations.
- Layer unlock visuals.
- Placeholder assets.

---

## Core Product Principles

These principles are non-negotiable during MVP implementation.

### Chat principles
Chat must remain:
- calm
- low-pressure
- without online status
- without typing indicators
- without read receipts
- without per-message timestamps

### Discovery principles
Discovery must be:
- intentional
- limited
- non-addictive

### Connection principles
Connection should be:
- gradual
- earned
- deeper over time

### App-in-chat principles
Apps should be:
- optional
- social
- conversation-supporting
- never manipulative

---

## Intentionally deferred until post-MVP or post-stabilization
To keep execution realistic, the following stay deferred unless required for MVP safety/reliability:

- Advanced platform complexity beyond current product scope.
- Non-essential growth mechanics.
- Overly broad feature expansion outside calm dating core loop.
- Visual/brand perfection work that blocks core functionality completion.

## Practical execution notes
- Finish stabilization before expansion.
- Keep contracts/documentation and implementation aligned each run.
- Prefer small, verifiable increments with clear run-level exit criteria.

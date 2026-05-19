# Lingr — Run 10 Review

## 1) Summary

Run 10 is a **real architectural step forward** for Lingr, not cosmetic polish. The core trust mechanic (relationship-owned, server-evaluated reveal progression) is now present in executable backend logic and is attached to messaging events, which is exactly where Lingr’s philosophy needs to live.

**Score: 7.4 / 10**

**Biggest strengths**
- Pair-scoped layer state with canonical pair ownership and persistence.
- Server-authoritative unlock progression tied to reciprocal interaction (not unilateral activity spikes).
- System-authored unlock messaging with guardrails preventing user-forged unlock events.
- Discovery DTO remains identity-constrained at Layer 0.

**Biggest risks**
- Layer thresholds currently count reciprocal alternation only; they do not distinguish meaningful vs low-effort exchange.
- Profile reveal resolver has brittle field derivation (e.g., truncating location string for “broad region”).
- Cross-surface inconsistency risk: API returns timestamps on conversation/message DTOs while philosophy bans urgency cues in UI.
- Emotional tone risk from “unlock” framing if it becomes the salient interaction loop.

**Readiness level**
- **Ready for controlled Run 11 start with a short cleanup gate** (stabilization first, then forward work).

**Does Run 10 make Lingr meaningfully different from conventional dating apps?**
- **Yes, partially and credibly**: pair-owned progressive visibility + no immediate identity dump is a meaningful product difference. But it is **not yet fully defensible** because the progression quality model is still simplistic and could be gamed.

**Is Run 10 strong enough to move to Run 11?**
- **Yes, if you do a focused Run 10 cleanup pass first (P0).**

---

## 2) What genuinely works

- **Relationship-owned layers are correctly modeled.** `RelationshipLayer` is keyed by `primaryUserId + secondaryUserId` and indexed for lookups, which makes progression pair-specific and persistent rather than user-global.
- **Server-authoritative progression is real, not performative.** Layer transitions happen in backend services (`syncLayerAfterMutualSpark`, `syncLayerAfterMessage`) and not on client-calculated counters.
- **Reciprocal interaction logic is philosophically aligned.** Incrementing only when sender alternates creates a minimal reciprocity criterion, preventing one-sided spam from force-progressing.
- **System unlock messages are subtle by default.** Copy is non-gamified (“Something new is now visible”) and system origin is enforced (`senderUserId: null`, client cannot post `layer_unlock`).
- **Hidden-state behavior is calm.** `hiddenHint` copy avoids premium/paywall tone and preserves gentle pacing.
- **Profile reveal system is materially integrated.** Conversation DTOs request relationship-scoped visible profile projections.
- **Localization discipline is present for unlock semantics.** Chat i18n entries keep calm tone in English and Norwegian.

What feels future-proof:
- Pair-canonical ownership pattern.
- Service-level authority and DTO projection split.
- Unlock messages as system events rather than client-side badges.

What feels emotionally right:
- Layer 0 anonymity in discovery payloads.
- Non-celebratory unlock copy and informational fallback.

---

## 3) Architecture concerns

### High severity
1. **Progression quality model is underpowered (meaningfulness not modeled).**
   - Current logic is pure reciprocal-turn counting with static thresholds (6/12). This can be advanced by low-substance back-and-forth.
   - Risk: “earned trust” becomes “message ping-pong optimization.”

2. **Profile visibility resolver has fragile assumptions.**
   - “Broad region” derived via `slice(0, 5)` is format-fragile and locale-fragile.
   - `interests` and `emotionalValues` are parsed from `layersSummary` text delimiters; this is brittle and semantically overloaded.

### Medium severity
3. **Cross-surface philosophy coupling gap.**
   - API DTOs include `createdAt/updatedAt` for messages/conversations. If frontends drift and render these, urgency mechanics re-enter by accident.

4. **Service boundary mild leakage.**
   - `syncLayerAfterMessage` loads conversation participants each message; acceptable now, but hot-path chatter can become expensive without batching/caching strategy.

5. **Unlock message personalization placeholder.**
   - `buildSystemMessage` defaults to “this person”; no injected partner name currently, which can feel generic in production.

### Low severity
6. **Potential state-reset semantics on mutual spark sync.**
   - `syncLayerAfterMutualSpark` sets `currentLayer` to layer 1 on update; this is likely safe for accepted flow but should be guarded against accidental downgrade paths in broader lifecycle transitions.

---

## 4) Lingr philosophy alignment

**Current feel:** mostly human and gradual, with early signs of transactional drift risk.

- **Human / gradual / curious / emotionally safe:**
  - Discovery anonymity and non-urgent presentation are intact.
  - Unlock copy is gentle and non-triumphal.
  - Hidden-state hint language is calm and non-punitive.

- **Where game-like drift could emerge:**
  - The concept of “Layer unlock” + fixed thresholds can become an optimization target if users perceive a deterministic ladder.
  - If UI ever foregrounds layer number/status too strongly, trust pacing turns into achievement pacing.

- **Subtle regression watchouts:**
  - “See a little more” CTA can feel reward-like if over-used.
  - Any future “you are X messages away” phrasing would break tone immediately.
  - Conversation surface includes active/paused state labels; if combined with frequent unlock banners, emotional texture can feel system-led instead of person-led.

Verdict: philosophy alignment is **good but fragile**. The architecture supports Lingr values; product tuning can still accidentally undo them.

---

## 5) UX concerns

### Discovery
- Strength: Layer 0 payload excludes direct identity/timestamps in tests and service DTO.
- Concern: still returns stable userId tokens; anonymity is practical but not absolute. Ensure no cross-screen identity reconstruction cues.

### Chat
- Strength: unlock banners are system-style and informational with CTA only when route exists.
- Concern: banner frequency and placement could interrupt conversational flow; no dampening logic shown.

### Profile reveal
- Strength: staged reveal fields by layer are wired.
- Concern: field derivation quality (region truncation, summary splitting) may create awkward or inaccurate reveals, harming perceived authenticity.

### Hidden sections
- Strength: calm hint copy.
- Concern: if many hidden fields render simultaneously, screen can feel “locked” despite soft language.

### System messages
- Strength: non-user-forgeable unlock messages.
- Concern: repetitive phrasing may read templated; emotional warmth depends heavily on copy variation.

Would this feel natural to a real person?
- **Mostly yes in early use**, but with risk of “mechanic awareness” after repeated chats unless progression quality and copy variety improve.

---

## 6) MVP practicality

### A) Internal fake-life testing
- **Supported now.**
- Remaining blockers: add telemetry for unlock event frequency, false-positive unlocks, and conversation abandonment after unlock.

### B) Trusted-friend testing
- **Nearly supported.**
- Remaining blockers: tighten reveal data quality (region + interests schema), add moderation/abuse fallback, and audit cross-surface timestamp exposure.

### C) First tiny regional beta
- **Not yet fully safe, but close.**
- Remaining blockers: anti-gaming hardening for progression, operational observability for layer transitions, and QA pass on emotional copy consistency.

---

## 7) Overengineering risks

- **Mild overfitting risk in “layer architecture” narrative vs current simple rules.** The architecture is solid, but don’t add deeper abstraction until signal model matures.
- **Premature generic domain utilities on web (`calculateLayerRevealState`)** if not tied to real API semantics can drift into parallel truth sources.
- **Avoid expanding unlock metadata schema too early.** Keep event payload minimal until analytics proves necessary dimensions.

For a solo founder, current complexity is acceptable, but only if you resist adding Layer 4/Window sophistication before Run 10 stabilization.

---

## 8) Suggested stabilization plan

### P0 — before Run 11
1. Replace brittle reveal derivations:
   - model `broadRegion` explicitly server-side (not `slice(0,5)`),
   - separate structured `interests`/`values` from `layersSummary` text.
2. Add anti-gaming progression safeguards:
   - minimum content-length heuristic,
   - cooldown between reciprocal increments,
   - optional “different-day” contribution for higher layers.
3. Add unlock event observability:
   - unlock reason, prior counter, conversation age, post-unlock retention.
4. Enforce no-timestamp rendering contract on all user-facing chat surfaces.

### P1 — during Run 11
1. Introduce adaptive progression quality scoring (still server-authoritative).
2. Add copy variation pool for unlock/hidden states to reduce template feel.
3. Add idempotency/concurrency tests around rapid multi-message sends.

### P2 — later
1. Personalization improvements for system messaging (partner-first-name safe injection).
2. Richer reveal controls (user-level comfort settings) without introducing urgency language.

### P3 — post-MVP
1. Layer explainability UX study (are people feeling trust or game?).
2. Model-based trust pacing tuned from observed emotional outcomes, not engagement maximization.

---

## 9) Prioritized next steps

1. **Run 10 cleanup pass (P0) immediately** — data modeling + anti-gaming + observability.
2. Add contract tests to guarantee no urgency metadata leaks into default client render paths.
3. Ship small copy-variation set for unlock/hidden states.
4. Run trusted-friend test cohort focused on “felt safety” and “felt pressure.”
5. Start Run 11 feature work only after P0 metrics are live.

**Should we start Run 11 now?**
- **Start a short Run 10 cleanup pass first (recommended), then begin Run 11.**

**Why:** the core architecture is good enough, but current progression semantics are still easy to game and reveal data shaping is too brittle for confident external beta behavior.

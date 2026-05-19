# Lingr — Run 11 Review

## 1) Summary

Run 11 is a serious step forward on *backend primitives* for conversation-scoped interaction, but it is not yet fully a production-grade “chat apps MVP” in end-to-end product terms.

**Overall assessment:** strong directional architecture with meaningful philosophy-aware copy guardrails, but incomplete integration and a few high-risk consistency gaps.

**Score:** **7.0 / 10**

**Biggest strengths:**
- Conversation ownership checks are consistently enforced before app actions, which protects emotional boundaries and data isolation.
- Match Cards and Guess Me implement mutual-reveal gating (both participants must complete before reveal), which aligns with paced trust.
- Snuggle semantics and copy are intentionally non-urgent and non-scoring.

**Biggest risks:**
- Run 11 appears service/test-complete but not route/UI-complete for chat apps: the API route table has no chat-app endpoints.
- Prisma schema drift: `snuggle` exists as an app id and is used in service/tests, but `SnuggleSession` model is missing in the canonical schema file.
- Snuggle currently exposes binary co-presence state (`sharedMomentState: together`) via direct hold toggles, which may still create subtle pressure dynamics.

**Readiness level:**
- Ready for **internal engineering validation**.
- Not fully ready for trusted-friend beta without cleanup.

**Do Chat Apps feel like Lingr?**
Partially yes in language and reveal mechanics; architecturally they currently feel more like **domain engines** than fully integrated conversation helpers.

**Or do they accidentally feel gamified?**
Not overtly gamified (no points/streaks/leaderboards), but Guess Me still has a “you guessed well/differently” framing and Snuggle’s together-state can implicitly behave like a micro-score of synchrony.

**Is Run 11 strong enough to move to Run 12?**
**Only after a short Run 11 stabilization pass (P0).**

---

## 2) What genuinely works

### Chat app foundation
- `AppSession` provides a conversation-scoped shared lifecycle object (`invite → active/complete/dismissed`) with actor fields (`invitedBy`, `acceptedBy`, etc.), which is a clean primitive for optional shared activities.
- The migration establishes explicit app IDs and lifecycle enum values for consistency.

### Lifecycle model
- Invite/accept/complete/dismiss transitions are centralized and reused by app flows.
- Match Cards and Guess Me each maintain independent app-specific session state with `completed` and `revealState` flags.

### Relationship ownership
- Every major operation gates through conversation participant verification before mutation. This is one of the most important “emotional safety in code” wins in Run 11.

### Persistence
- Dedicated persistence for `app_sessions`, `match_cards_sessions`, and `guess_me_sessions` exists with conversation indexes.
- Guess Me has its own migration and foreign keys; data is conversation-linked and cascades.

### Match Cards
- Reflective prompt bank and reveal-after-both-answer behavior are implemented directly.
- The mechanics are collaboration-first (no scoring path).

### Guess Me
- Own answer + partner guess both required per participant; reveal unlocks only after full completion.
- Tone copy avoids explicit winner/loser language in localization tests.

### Snuggle
- Consent-first flow is structurally present (`invite` then `accept` before start).
- Shared state only becomes “together” when both opt in; completion language uses neutral “moment passed.”

### Localization discipline
- English and Norwegian keys are parity-checked for Match Cards, Guess Me, and Snuggle.
- Tests explicitly block urgency/competition language patterns in key chat-app copy.

### Accessibility
- Baseline chat surfaces use semantic buttons and ARIA current state for active conversation list selection.
- Accessibility is still only foundational; there is no dedicated app-level a11y behavior coverage yet.

---

## 3) Architecture concerns

### Critical
1. **Schema/runtime inconsistency (`SnuggleSession` missing in Prisma schema):**
   - Service and tests use `db.snuggleSession`, but canonical `schema.prisma` does not define `model SnuggleSession`.
   - This is a high-severity maintenance and migration risk (tooling, codegen, and future migrations can diverge).

2. **No route-level exposure for chat apps in API router:**
   - `chat-app-service` exists, but `routes/index.js` registers no chat-app invite/start/answer/hold endpoints.
   - This blocks true integration and external testability, and suggests “MVP complete” may be overstated.

### High
3. **Lifecycle enum mismatch risk (`accept` enum value vs `active` transition usage):**
   - Enum contains `accept`, but service transitions invite acceptance directly to `active`.
   - This is confusing for analytics/ops and future state-machine correctness.

4. **Overly permissive transition helper:**
   - Shared `transition()` does not enforce prior-state legality (e.g., accepting an already completed session) unless DB/application caller discipline prevents it.
   - Risk: inconsistent states when multiple clients or retries are involved.

### Medium
5. **State fields are raw strings instead of constrained enums for app-specific sessions:**
   - `state`, `revealState`, and completion reason fields are text across app tables.
   - Faster iteration now, but easy to accumulate invalid values later.

6. **Snuggle double-update per hold mutation:**
   - `setSnuggleHoldState` performs one update for hold flag, then another for shared state.
   - Not fatal, but adds race window and unnecessary write churn.

### Low
7. **Prompt selection by `id.length` seed:**
   - Deterministic but simplistic; can create uneven content distribution and predictability.

---

## 4) Lingr philosophy alignment

Run 11 is mostly aligned at the mechanic and language layer, with a few subtle pressure risks.

### Match Cards
- Strong alignment: reflective prompts + bilateral reveal create paced vulnerability without urgency.
- Feels like a conversation helper, not a game.

### Guess Me
- Mostly aligned, but it sits closest to “mini-game” territory.
- Positive: no points, no ranking, no timer.
- Risk: “you guessed each other surprisingly well” framing can still feel evaluative; repeated use may create “performance” energy.

### Snuggle (deep check)
- Positive:
  - Explicit invitation/acceptance flow respects consent.
  - Neutral ending copy (“moment passed”) avoids rejection framing.
- Risk:
  - The real-time-ish `together`/`quiet` shared state can become an implicit “are you here with me right now?” signal.
  - Even without online indicators, this can leak relational responsiveness pressure in practice.

### Verdict on emotional alignment
- Not Tinder/Hinge-swipe drift.
- Not addictive-mechanics drift.
- **But still vulnerable to subtle gamification-by-state in Guess Me/Snuggle unless framing and interaction cadence are tightened.**

---

## 5) UX concerns

1. **Invitation flow incompleteness:** backend domain exists, but route/UI wiring for app actions appears absent in primary API route map, so real user flow is likely not end-to-end.
2. **Waiting states:** Match Cards/Guess Me correctly support “wait until both complete,” but without explicit decay/closure UX patterns, users may feel suspended.
3. **Reveal mechanics:** functionally correct, emotionally good; should ensure reveals are framed as discovery, not correctness.
4. **Decline behavior:** Snuggle has neutral decline copy, but domain-level lifecycle currently uses complete for decline scenarios in tests, which can blur semantics.
5. **Consent flow:** structurally present for Snuggle; good starting point.
6. **Chat integration depth:** chat apps are not visibly integrated into the existing conversation UI path in this run.
7. **Awkwardness risk:** Guess Me can feel forced if prompts are too “quiz-like”; Snuggle can feel awkward if one person toggles hold and sees “quiet” too long.

Would this feel natural to real people today?
- **Partially** in concept and copy.
- **Not fully** in implemented UX because of integration gaps and subtle pressure vectors.

---

## 6) MVP practicality

### A) Internal testing
**Yes**, with caveats.
- Domain-level service tests are solid and philosophy-aware for copy constraints.
- Still blocked by schema consistency cleanup and route integration validation.

### B) Trusted-friend testing
**Not yet.**
- Needs end-to-end app action routes + UI entry points.
- Needs Snuggle pressure audit in real conversational usage.

### C) First tiny regional beta
**No.**
- Missing hardening: state-machine guardrails, schema parity, observability, and complete UX flows.

---

## 7) Overengineering risks

1. **Premature multi-app framework complexity:**
   - App session + per-app session tables are justified, but continuing to add app abstractions before full end-to-end one-app quality could slow delivery.
2. **State proliferation via free-text status fields:**
   - Fast now, expensive later.
3. **Dual-layer architecture without product integration:**
   - Building deeper service primitives ahead of user-visible completion risks architecture momentum outrunning product truth.

For a solo founder, the biggest risk is **shipping “conceptually elegant internals” before emotionally verified user loops**.

---

## 8) Suggested stabilization plan

### P0 — before Run 12
1. Add missing `SnuggleSession` model to `schema.prisma` (or remove runtime references if intentionally deferred) and reconcile migrations.
2. Add explicit chat-app API routes for invite/accept/dismiss/start/answer/hold/complete.
3. Enforce lifecycle transition legality (state machine checks + idempotency behavior).
4. Separate “declined” from “completed” semantics where needed.
5. Add at least one end-to-end test per app through HTTP route layer.

### P1 — during Run 12
1. Tighten Guess Me copy to avoid “performance” framing.
2. Add Snuggle safety refinements (e.g., soften/aggregate co-presence state so it doesn’t feel like live attendance tracking).
3. Add app-level a11y checks (focus management, SR announcements for reveal/consent changes).

### P2 — later
1. Convert app `state`/`revealState` fields to enums.
2. Refine prompt selection strategy and content diversity control.
3. Add moderation/safety hooks for app payload content.

### P3 — post-MVP
1. App analytics oriented around emotional safety outcomes, not engagement volume.
2. Feature flags for app rollout cohorts.
3. Operational dashboards for state-transition anomalies.

---

## 9) Prioritized next steps

1. **Fix schema drift now** (`SnuggleSession` parity + migration sanity).
2. **Ship route-level chat-app integration** so the MVP is truly testable end-to-end.
3. **Add lifecycle guardrails** (legal transitions + decline semantics).
4. **Run focused emotional QA on Snuggle** for pressure/presence leakage.
5. **Refine Guess Me reveal language** to keep it reflective, not evaluative.
6. **Add a11y verification for app state transitions**.
7. Then proceed to Run 12.

**Should we start Run 12 now?**
- **Do a short Run 11 cleanup pass first.**

**Why:** The current risks are not about polish; they are structural truthfulness risks (schema, routes, lifecycle semantics) plus subtle emotional-safety drift points. Stabilize first, then continue.

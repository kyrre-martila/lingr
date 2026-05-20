# Lingr — Run 11.6 Review

## 1) Summary

Overall assessment: **strong direction with a few meaningful cleanup items needed before advancing**. Run 11.6 largely succeeds at translating “trust unfolds over time” into backend mechanics, with defaults and service behavior that are notably calmer than traditional engagement systems.

**Score: 7.9/10**

Biggest strengths:
- Trust is relationship-scoped in `relationship_layers`, not user-global.  
- Layer unlock requires **both** time and trust thresholds via DB-configured `LayerRule`.  
- Trust accumulation is mostly event-based and internal-only, with no visible progress UI.  
- Idempotency guards exist for app-completion signals and unlock system messages.

Biggest risks:
- Message-turn trust can still be lightly “farmed” due to a short 20-second pacing gate and a simple length heuristic.
- Unlock timing logic currently uses `layer1UnlockedAt` for all transitions, which may not match intended per-layer elapsed semantics as product complexity grows.
- Configuration flexibility is good, but governance/guardrails for live config changes are currently thin.

Readiness level: **“Proceed with caution”** (targeted cleanup first, then continue).

**Does trust-score Layers feel like Lingr?**  
Mostly yes: this implementation reads more like hidden relational state than overt gamification, because user-facing dopamine cues are absent and unlock copy is subdued. But the current signal weights/pacing can still create hidden-XP dynamics if not tuned and observed closely.

**Does it accidentally become hidden XP?**  
Not by architecture intent, but it can drift in that direction operationally if rapid low-depth message turns dominate score gain.

**Is Run 11.6 strong enough to continue to Run 12?**  
**Do a focused Run 11.6 cleanup first (small P0 pass), then proceed to Run 12.**

Or does it require cleanup first? **Yes—lightweight cleanup first.**

---

## 2) What genuinely works

### LayerRule model
- Cleanly models progression gates with `fromLayer`, `toLayer`, `minElapsedMinutes`, `requiredTrustScore`, `enabled`.
- Unique/index structure supports deterministic lookup and operational updates.
- Defaults match Run 11.6 prompt (4h/20 and 16h/55).

### TrustSignalRule model
- Canonical signal list and points are centralized, seedable, and DB-driven.
- Enables product tuning without code deploys.

### Relationship-scoped trust
- `RelationshipLayer` anchors trust between a canonical user pair (`primaryUserId`, `secondaryUserId`) with a pair-unique constraint.
- This strongly reinforces “trust is between two people,” not a profile score.

### Message-turn accumulation
- Uses reciprocal-turn detection (`lastMessageSenderId` must alternate), minimum content length, and a pacing gate.
- This is materially better than raw message-count incentives.

### Match Cards / Guess Me / Snuggle integration
- App-complete transitions trigger trust signals through `syncLayerAfterTrustSignal`.
- Completion checks prevent duplicate increments once session is completed.

### Transaction safety
- Trust accumulation + layer advancement run in DB transactions.
- Unlock message creation checks for existing unlock event (per layer) before insert, reducing duplicate noise.

### Config-driven thresholds
- `ensureLayerTrustRules` seeds defaults while keeping runtime values DB-driven.
- Good MVP balance between strong defaults and evolvability.

### Invisible progression
- No progress bars, XP, streaks, or visible trust score.
- System message language is understated and relational, not reward-badge style.

What feels emotionally right:
- Unlock copy and absence of urgency mechanics.
- Mutual, relationship-level progression.

What feels architecturally strong:
- Clear separation of rule config vs runtime progression logic.
- Consistent signal ingestion path via `syncLayerAfterTrustSignal`.

What feels differentiated:
- Internal trust model in service of gradual reveal, without explicit gamified feedback loops.

---

## 3) Architecture concerns

### High severity
1. **Potential race-induced trust overwrite under concurrent signals**
   - `maybeApplyTrustSignal` computes `trustScore = state.trustScore + trustDelta` from pre-read state and then writes absolute value.
   - Concurrent transactions can both read same base and lose one increment (“last write wins”), or produce inconsistent unlock timing.
   - Severity: high because production messaging/apps can emit near-simultaneous events.

2. **Elapsed-time gate coupled to `layer1UnlockedAt` for all transitions**
   - `hasMinimumRelationshipAgeForRule` always evaluates from layer-1 unlock timestamp.
   - Works for current 1→2 and 2→3 defaults if interpreted as relationship age, but limits future expressiveness and can silently misalign intent.

### Medium severity
3. **Idempotency is uneven by signal type**
   - App flows largely idempotent after completion checks.
   - Message-turn logic depends on mutable conversational cadence state; good but still heuristic-based and susceptible to edge pacing behavior.

4. **Config drift / unsafe admin edits risk**
   - Runtime config is powerful, but no documented constraints to prevent extreme values (e.g., 0-minute rules, huge or negative points, disabled critical rules).

5. **Hidden coupling between trust rules and product feel**
   - The same mechanism powers varied experiences (messages + mini-apps) but lacks balancing telemetry in code to detect disproportionate source contribution.

### Low severity
6. **Single-step unlock evaluation per event**
   - `nextLayerFor` evaluates one transition at a time. Fine for MVP, but multi-step catch-up after large trust jumps may need explicit future policy.

7. **Operational observability gaps**
   - No explicit audit trail for why trust changed (which signal, delta, before/after), which can slow tuning/debugging.

---

## 4) Lingr philosophy alignment

### Does this feel like gradual trust or engagement optimization?
Current implementation is **closer to gradual trust**, but sits near a boundary where optimization dynamics can emerge if tuning is off.

### Signal-by-signal fit
- **quality_message_turn (+2):** philosophically valid if truly quality-gated; currently vulnerable to lightweight farming due to minimal heuristics.
- **match_cards_completed (+8):** strong fit; deliberate co-participation and mutual completion.
- **guess_me_completed (+6):** strong fit; reflective and bilateral.
- **snuggle_shared (+5):** generally fitting as shared soft-intimacy behavior.
- **playing_now_shared (+2):** weakest philosophically; can become low-effort “tap to progress” if overused.

### Time thresholds (4h to Layer 2, 16h to Layer 3)
- **4h / 20 points:** plausible for MVP early closeness if trust events are meaningful.
- **16h / 55 points:** defensible for early beta, but could still feel quick if message-turn accumulation dominates.

### Could users farm layers unknowingly?
Yes, especially via alternating 12+ char messages every ~20s, or repeated lightweight playing-now shares.

### Would fast-clicking users progress too quickly?
Potentially yes, depending on chat cadence and mini-app usage bursts.

### Would genuine connection feel naturally rewarded?
Yes in many cases, particularly when progression comes from shared-app completions + sustained reciprocal messaging over time.

Bottom line: philosophically aligned **in intent and mostly in implementation**, but needs stricter anti-farming calibration to avoid hidden-XP behavior.

---

## 5) UX concerns

- **Unlock pacing:** currently acceptable for MVP, but likely variable across user archetypes (quiet vs high-frequency chatters).
- **Emotional feeling:** unlock messaging is calm and non-congratulatory, which is correct.
- **Pressure risk:** low from UI (no visible score), medium from behavior if users notice certain actions “seem” to unlock layers faster.
- **Reveal timing:** can feel natural when thresholds are met via mixed signals; can feel mechanical if one signal class dominates.
- **Hidden-system awkwardness:** invisibility helps reduce pressure, but complete opacity can feel arbitrary if unlocks appear inconsistent.
- **Incentive side-effects:** low-to-moderate risk of short-form reciprocal chatter optimizing for progression.

Expected user perception split:
- Many: “we naturally got closer.”
- Some: “something gamey is happening behind the scenes,” especially if unlocks correlate with rapid low-depth exchanges.

---

## 6) MVP practicality

### A) Internal testing
**Yes, ready** with current implementation.
- Sufficient for validating correctness of unlock logic and trust ingestion paths.

### B) Trusted-friend testing
**Mostly ready, with P0 safeguards recommended first.**
- Add basic anti-farming hardening + simple trust-change observability before broader friend testing.

### C) Tiny regional beta
**Not yet ideal without cleanup.**
- Need stronger concurrency correctness and tuning telemetry to prevent silent progression artifacts.

Key blockers by stage:
- Internal: minor.
- Trusted-friend: anti-farming + metrics visibility.
- Tiny beta: concurrency hardening + config governance + balancing instrumentation.

---

## 7) Overengineering risks

For a solo founder, Run 11.6 is mostly **not** overengineered; it’s a thoughtful middle ground. But watch these:

- **Config flexibility ahead of governance:** DB-driven rules are valuable, but without constraints/tools they can become fragile.
- **Signal surface expansion before calibration:** adding many trust-emitting features before measurement can dilute trust meaning.
- **Implicit policy in code paths:** subtle behavior (single-step unlock, layer1-based elapsed time) can ossify unnoticed.

No rewrite needed. Keep the architecture; tighten execution details.

---

## 8) Suggested stabilization plan

### P0 — before Run 12
1. Harden trust increment concurrency (atomic increment/update strategy within transaction).
2. Tighten message-turn anti-farming (e.g., stronger cadence floor and/or richer quality heuristic).
3. Add guardrails for rule values (non-negative points, sane elapsed minimums, bounded ranges).
4. Add internal analytics/audit fields for trust events (source signal, delta, resulting score).

### P1 — during Run 12
1. Rebalance signal weights using internal/friend-test data.
2. Revisit `playing_now_shared` frequency handling (cooldown or diminishing contribution).
3. Clarify elapsed-time semantics per transition (relationship age vs prior-layer age) and encode explicitly.

### P2 — later
1. Introduce rule versioning/change logs for safe live tuning.
2. Add soft anomaly detection for suspicious progression bursts.

### P3 — post-MVP
1. Explore richer trust semantics (context-sensitive signals) only after stable baseline behavior.
2. Add admin tooling for safe experimentation with rollback.

Preferred path: **stabilize → continue**.

---

## 9) Prioritized next steps

1. **Implement concurrency-safe trust accumulation** (prevent lost updates).
2. **Add anti-farming constraints for quality-message turns** (pacing + quality).
3. **Instrument trust-source contribution and unlock diagnostics**.
4. **Add validation constraints for LayerRule/TrustSignalRule updates**.
5. **Run a short friend-test calibration pass** on current 4h/16h and 20/55 thresholds.
6. **Proceed to Run 12** once P0 is complete and no major anomalies appear.

**Explicit decision:**  
Do a **Run 11.6 cleanup first (P0)**, then continue to Run 12.

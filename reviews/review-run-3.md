# Run 3 Review — Domain Architecture (Glimps, Layers, Spark, Window, Emotional Compatibility, Safety)

## 1) Summary
Run 3 makes a clear attempt to move logic out of UI components and into domain modules, which is the right direction for long-term maintainability and future platform portability. The new domain surface (`domain/glimps`, `layers`, `spark`, `window`, `compatibility`, `safety`) is cohesive at a folder level and exposes readable, explainable function names.

However, the current implementation still has meaningful overlap and coupling risks:
- several domains solve adjacent pacing/safety concerns without a clear “single source of truth,”
- some domain contracts are not yet normalized around shared enums/value types,
- domain outputs are still wired directly into DOM composition inside `components/conversations/index.js`, and
- there is no application-service layer to orchestrate cross-domain decisions.

Overall: strong structural progress, but before Run 4 the architecture needs explicit boundary contracts and an orchestration layer so these domains remain reusable for backend/mobile work.

---

## 2) What is working well

- **Domain extraction is real and practical**: conversation logic now consumes Window, Compatibility, and Safety modules instead of embedding all heuristics inline, which is a meaningful separation-of-concerns improvement. (`apps/web/src/components/conversations/index.js`, `apps/web/src/domain/window/index.js`, `apps/web/src/domain/compatibility/index.js`, `apps/web/src/domain/safety/index.js`)
- **Explainable, rule-based logic** is prioritized over opaque scoring in Safety and Window modules, consistent with Lingr trust goals. (`apps/web/src/domain/safety/index.js`, `apps/web/src/domain/window/index.js`)
- **Domain index exports are centralized**, giving a clean import seam for future clients/services. (`apps/web/src/domain/index.js`)
- **Conversation mock payloads now include structured context** (`compatibilityProfile`, `safetyContext`, `boundaryPreferences`) which is helpful for future API contract design. (`apps/web/src/data/mocks/conversations.js`)
- **Platform-neutral function shapes** are mostly pure input/output helpers and are not directly DOM-dependent. (`apps/web/src/domain/*/index.js`)

---

## 3) Main architecture concerns

1. **No orchestration layer for cross-domain flows**
   - `components/conversations/index.js` directly calls many domain functions in sequence and performs integration logic in the view layer.
   - This creates a “smart UI” pattern that will be hard to reuse in mobile or backend-for-frontend contexts.

2. **Domain contracts are not sufficiently normalized**
   - Some modules use shared constants/enums (`WINDOW_STATES`, `SAFETY_STATES`), but orchestration code still passes literal strings (e.g., `'reflective'`, `'accepted'`) in places.
   - This increases drift risk when contract values evolve.

3. **Placeholder semantics can leak into permanent architecture**
   - Multiple `*Placeholder` functions are useful now, but there is no documented replacement boundary (e.g., which become backend-owned vs client-owned rules).
   - Without explicit ownership, future integrations may duplicate business logic across client/server.

4. **State ownership remains split between domain outputs and component-local derivations**
   - Conversation state stores only active ID, while runtime policy is recomputed in component render from mock snapshot + domain calls.
   - This is fine for prototype, but lacks a durable domain state model.

---

## 4) Domain overlap risks

### A. Safety vs Window pacing overlap
- Window exposes pacing-related policy (`determineWindowRhythm`, `getIntentionalPacingRecommendation`, future pacing placeholder).
- Safety also exposes pause/intervention recommendations (`createPauseRecommendation`, `suggestGentleIntervention`).
- In conversations UI, both systems produce overlapping “slow down / pause / pacing” guidance, which can diverge over time and confuse rule ownership.

### B. Compatibility vs Spark resonance overlap
- Spark computes resonance/readiness via weighted numeric signals (`calculateSoftResonanceSignals`, `canStartSpark`).
- Compatibility computes relationship fit via signal states + hints (`createCompatibilitySignals`, resonance/pacing placeholders).
- These two systems both model “is this connection ready / resonant?” with different representations and thresholds, but no unifying contract.

### C. Glimps moderation vs Safety governance overlap
- Glimps has moderation/safety placeholder logic (`evaluateGlimpsSafetyPlaceholder`, moderation flags).
- Safety domain has trust/safety/boundary decisioning for conversations.
- There is no shared safety taxonomy across content-level safety (Glimps) and conversation-level safety (Safety domain).

### D. Layers concept is underconnected
- `calculateLayerRevealState` exists as an isolated reveal utility, but Layers is not clearly integrated with Spark/Window/Safety decisions.
- Risk: Layers becomes conceptual duplication of pacing depth already handled elsewhere.

---

## 5) Coupling concerns

1. **UI coupling to orchestration details**
   - `components/conversations/index.js` is tightly coupled to the full chain of domain calls and the exact shape of mock payload fields.
   - Any change in domain output shape will force UI rewiring.

2. **Mock schema coupling across modules**
   - Conversation mocks import domain factories directly (`createCompatibilityProfile`) and domain enums (`WINDOW_STATES`, `WINDOW_RHYTHMS`), coupling mock data definitions to current domain internals.

3. **Implicit coupling via string literals**
   - UI logic compares literal values (`resolvedRhythm === 'reflective'`, spark status strings) instead of consistently using exported enums in every branch.

4. **Potential future circular evolution pressure**
   - As Safety/Window/Spark/Compatibility mature, component-driven integration may force each domain to adapt to UI needs rather than domain contracts, reversing intended layering.

---

## 6) Mobile/backend readiness

### Mobile readiness
- **Good**: domain modules are mostly pure and can be reused outside DOM.
- **Risk**: composition logic is still in a web component; mobile client would need to re-implement the same orchestration unless moved into shared application services.

### Backend readiness
- **Good**: placeholder contracts and structured outputs indicate future API seams (e.g., reporting hook object, window policy hints).
- **Risk**: no explicit split of authoritative rules (server) vs presentational recommendations (client). Future persistence/auth integration could cause duplicated logic if this boundary is not set now.

### Future auth readiness
- Current domains are user-agnostic enough to support authenticated users later, but they assume trusted local context inputs.
- Missing pieces for auth era:
  - actor/subject identity in domain inputs,
  - explicit permission/visibility evaluation contracts,
  - auditable event shape for moderation/reporting actions.

---

## 7) Philosophy alignment concerns

Overall Run 3 remains strongly aligned with Lingr philosophy, but there are a few watchouts:

- **Gamification risk (low, but present)**
  - Spark resonance uses weighted scores and thresholds. If surfaced carelessly in UI later, this could drift toward “match score” behavior.
- **Manipulation risk (low)**
  - Multiple recommendation systems (Window + Safety + Compatibility hints) could become directive if not clearly framed as optional reflective prompts.
- **Swipe-app drift (currently low)**
  - No strong swipe mechanics present; however, if Spark readiness logic becomes overly binary/high-frequency, it could mimic rapid-decision flows.

Recommendation: preserve “gentle suggestion, not optimization target” posture in both contracts and copy.

---

## 8) Suggested cleanup/refactor plan

1. **Add a conversation domain-application service (highest priority)**
   - Create a platform-neutral orchestrator (e.g., `domain/conversation-session/` or `app/services/conversation-domain-service.js`) that:
     - accepts conversation snapshot + session context,
     - calls Window/Compatibility/Safety,
     - returns one normalized view-model contract.
   - UI should render this contract instead of coordinating domain calls.

2. **Define a shared “relationship state contract”**
   - Introduce shared enums/types for:
     - pace/rhythm,
     - readiness levels,
     - safety severity,
     - intervention urgency.
   - Map each domain to this contract to reduce overlap and translation ambiguity.

3. **Unify safety taxonomy across Glimps and conversations**
   - Create one safety vocabulary package/module for flags/events/categories.
   - Keep channel-specific evaluators (Glimps vs conversation) but produce interoperable outputs.

4. **Clarify domain ownership boundaries**
   - Document which domain owns:
     - pacing recommendation,
     - trust signal,
     - compatibility interpretation,
     - escalation/reporting payload shape.

5. **Split placeholder policy from stable contract**
   - Keep function signatures stable, but move placeholder logic behind clearly named strategy adapters (e.g., `localPrototypePolicy` vs future `serverPolicyResult`).

6. **Add contract tests for domain modules**
   - Add unit tests for edge cases and cross-domain consistency (especially Window/Safety overlap and Spark/Compatibility mapping).

---

## 9) Prioritized next steps (before Run 4)

### P0
- Build the cross-domain conversation service layer and remove orchestration logic from `components/conversations/index.js`.
- Define and document overlap boundaries between Safety, Window, Spark, and Compatibility.

### P1
- Introduce shared enums/type guards for rhythm/readiness/safety/intervention values; eliminate remaining string-literal coupling.
- Unify Glimps safety flags with conversation safety taxonomy.

### P2
- Add backend-ready contract shapes:
  - moderation/reporting event payloads,
  - persisted conversation-window state DTO,
  - compatibility snapshot schema.

### P3
- Add domain-level test suite and a short architecture doc that explains the end-to-end decision flow for explainability and onboarding.

---

## Concrete files/modules reviewed
- `apps/web/src/domain/index.js`
- `apps/web/src/domain/glimps/index.js`
- `apps/web/src/domain/layers/index.js`
- `apps/web/src/domain/spark/index.js`
- `apps/web/src/domain/window/index.js`
- `apps/web/src/domain/compatibility/index.js`
- `apps/web/src/domain/safety/index.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/src/components/safety.js`
- `apps/web/src/state/conversations.js`
- `apps/web/src/data/mocks/conversations.js`
- `reviews/run-3-notes.md`

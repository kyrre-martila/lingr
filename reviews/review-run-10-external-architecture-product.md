# Lingr — Run X Review

## 1) Summary

Overall assessment: the codebase shows meaningful progress toward a philosophy-led product, but it is not yet architecture-safe for soft launch without targeted stabilization. The strongest part is explicit domain vocabulary and contract centralization. The weakest part is auth/session reality, localization discipline in UI, and policy consistency across API surfaces.

Readiness level: **internal testing ready**, **friendly testing conditionally ready**, **soft launch not ready**.

Biggest strengths:
- Shared contract surface with domain constants and reason-code taxonomy used in both API and web layers.
- Discovery throttling and anti-pressure constraints are encoded in backend rules (daily cap + cooldown + no swipe mechanics).
- Conversation service blocks client-origin system message types, reducing abuse surface.

Biggest risks:
- Auth/session is still in-memory (single-process state), which is a hard production blocker.
- Product philosophy is partially enforced in backend but inconsistently expressed in frontend copy/DTO exposure (timestamps still present in DTOs, hardcoded strings bypass i18n).
- Region and account-lifecycle policy boundaries are fragmented; denial semantics vary by endpoint.

**Score: 6.4 / 10.**

Why: strong intent and decent core boundaries, but critical launch-path weaknesses remain in auth persistence, policy consistency, and localization/UX contract rigor.

---

## 2) What is working well

1. **Contract-first domain vocabulary is real, not decorative.**
   `packages/shared/src/contracts.js` is used as canonical source for error kinds, reason codes, lifecycle enums, conversation/message types, and ID prefix strategy. This materially reduces enum drift risk and makes client/backend alignment tractable as surface area grows.

2. **Discovery is intentionally constrained by design and implementation.**
   Daily cap (`DISCOVERY_LIMIT_PER_DAY = 3`), explicit cooldown for “not now,” blocked-user filtering, and spark dedupe represent direct anti-dopamine implementation choices. This matters because it operationalizes “slow dating” in allocation logic, not marketing copy.

3. **Message-type policy enforcement exists at service layer.**
   `sendConversationMessage` rejects system-origin types from clients. That is a good security + product boundary because it prevents users from spoofing product-state events.

4. **Persistence model is directionally sane for MVP.**
   Spark→Conversation uniqueness, participant uniqueness, and message indexing are practical and likely sufficient for early-stage load patterns.

Scale outlook: these strengths should scale to friendly testing and early soft launch if auth/session and policy consistency gaps are fixed first.

---

## 3) Main architecture concerns

### P0 severity
1. **Auth boundary is architecturally non-production (in-memory user + session store).**
   `session-store.js` stores users/sessions in process-local Maps and hashes passwords with plain SHA-256. This is a hard blocker for multi-instance deployments, restart safety, incident response, and credential-hardening expectations.

2. **Policy enforcement is not centralized enough.**
   Viewer lifecycle checks are embedded in some services (e.g., discovery readiness), but equivalent guardrails are not uniformly visible across all write paths. This increases drift risk as features expand.

### P1 severity
3. **Hidden coupling between product philosophy and raw DTO fields.**
   Message/conversation DTOs include created/updated timestamps. UI currently doesn’t render explicit timestamps, but contracts expose them everywhere, making future accidental urgency regressions easy.

4. **Service ownership boundaries are thin around cross-domain actions.**
   Discovery directly calls spark creation after dismissal. This is pragmatic, but as rollback/retry complexity grows, this seam will need explicit orchestration or transactional policy.

### P2 severity
5. **API README/documentation lags implementation reality.**
   API README still frames auth/session as deferred while code now includes a minimal implementation. This causes onboarding confusion and false confidence during reviews.

---

## 4) API / service concerns

1. **HTTP semantics mostly acceptable, but not fully disciplined.**
   There is consistent envelope usage and status codes, but some operation outcomes are semantically overloaded (e.g., discovery spark returns `state: 'already_exists'` instead of a conflict contract path).

2. **Reason-code discipline is strong, but transport normalization is incomplete.**
   Shared reason codes exist and are used, which is good. But there is still a mix of ad-hoc frontend error strings and reason-code-driven messaging.

3. **Auth propagation is present but fragile due to backing store.**
   Bearer token parsing + viewer context resolution exists, but this is only as reliable as the in-memory session store.

4. **Mock-vs-real gap is still significant.**
   Web service layer contains sync mock calls and fallback flows while API has growing real persistence. This increases integration drift risk and can mask backend contract regressions.

---

## 5) Persistence concerns

1. **Good:** key relational anchors exist (Spark uniqueness, participant uniqueness, message indexing).
2. **Concern:** no visible retention/redaction lifecycle for messages/glimpses beyond status flags; privacy deletion requirements may become expensive later.
3. **Concern:** discovery tracker increment and dismiss flow can face race windows under concurrent requests; current sequence is straightforward but not explicitly transactional.
4. **Concern:** auth/session data is not in DB at all in current implementation path, so persistence correctness for sessions is effectively absent.

Shortcut debt: acceptable for internal prototype, unacceptable for soft launch.

---

## 6) Frontend / UX concerns

1. **Calm intent is visible, but i18n discipline is inconsistent in key interaction surfaces.**
   Conversations component contains many hardcoded English UI strings. This violates the stated “UI strings must use translation keys” direction and creates launch-copy inconsistency across locales.

2. **Subtle regression risk: familiar “send now” mechanics remain default.**
   Even without swipe/timestamps/read receipts, the composer still uses standard instant-send framing. Not wrong for MVP, but easy to drift toward conventional dating-chat pressure if guardrails are not explicit.

3. **Tone quality is mostly aligned.**
   “Take your time,” calm menu naming, and no visible urgency indicators are directionally consistent with Lingr.

Anything too “dating app”: list/detail conversation shell with active-state highlighting is conventional and acceptable, but if followed by recency sorting emphasis and activity cues it could quickly become typical engagement UX.

---

## 7) Contract consistency concerns

1. **Strong central contract module, weak enforcement at render layer.**
   Contract enums/reason codes are centralized, but frontend view components still bypass translation and sometimes message off error kind instead of reason code.

2. **Potential enum drift risk is reduced but not eliminated.**
   Shared constants help; however, mock transport + mock data paths can silently diverge from API payload evolution.

3. **DTO shape consistency is decent today.**
   Prefix ID strategy and canonical fields are used consistently in services.

---

## 8) Philosophy alignment

Does it still feel like Lingr? **Mostly yes, with notable drift risk vectors.**

Aligned:
- no swipe mechanics
- no online/read/typing status in visible UX
- discovery pacing limits and cooldown

Drift vectors:
- pervasive timestamps in DTOs can reintroduce urgency later with one UI decision
- recency-sorted conversation/discovery patterns can become engagement loops if coupled with nudges
- hardcoded microcopy in core chat flow weakens deliberate emotional tone control and localization quality

Verdict: still Lingr, but needs stronger policy rails to stay Lingr under future feature pressure.

---

## 9) MVP practicality

Can this realistically ship? **Not yet for soft launch. Yes for internal and controlled friendly testing after P0 fixes.**

Missing before internal testing:
- none critical (already testable)

Missing before friendly testing:
- persistent auth/session backend with credential hardening
- consistent reason-code-driven error rendering on key surfaces

Missing before soft launch:
- production-grade session lifecycle + revocation
- i18n compliance on core UX paths
- explicit privacy lifecycle policy (retention/deletion/redaction)
- policy consistency audit across all write endpoints

False complexity: some contract breadth (many enums/shapes) is ahead of proven usage, but manageable if disciplined.

---

## 10) Overengineering risks

1. **Early expansion of message payload taxonomy may outpace real product learning.**
   Multiple message/app payload shapes are defined before user-validated usage patterns.

2. **Large shared contract surface before full enforcement tooling.**
   Central constants are useful, but without strict CI checks against mock and UI usage they become aspirational complexity.

3. **Multi-surface docs + run artifacts can hide source-of-truth confusion.**
   Many review/design files are helpful historically but increase execution noise for a solo founder.

---

## 11) Suggested stabilization plan

### P0 — must fix immediately
1. Replace in-memory auth/session with DB-backed sessions and password hashing suitable for production (argon2/bcrypt).
2. Add centralized policy guard tests covering auth + lifecycle + region availability across all mutating endpoints.
3. Enforce i18n keys in conversations and other high-touch product UI (no hardcoded user-facing strings).

Why: these are launch blockers and highest risk multipliers.

### P1 — important next
1. Reduce philosophy regression surface by stripping non-essential urgency-adjacent fields from default DTO payloads (or gate them behind internal/debug fields).
2. Normalize reason-code-first frontend error handling.
3. Add transactional protection or idempotency strategy for discovery dismiss/spark paths.

Why: protects product intent and reduces subtle behavior drift.

### P2 — later
1. Clean API/docs drift (README vs current implementation).
2. Add data retention/redaction policy docs and migrations.
3. Tighten mock-vs-real conformance tests around all active operations.

### P3 — post-MVP
1. Revisit whether all defined message/app payload types are earning their complexity.
2. Introduce lightweight architectural decision records for policy boundaries.

---

## 12) Prioritized next steps

1. Implement DB-backed session/auth hardening (single biggest launch risk reducer).
2. Add endpoint-level policy matrix tests (auth, lifecycle, region) and make them required in CI.
3. Remove hardcoded UI strings from conversation flow and route through i18n namespaces.
4. Standardize frontend error rendering to reasonCode mapping, not ad-hoc text branches.
5. Add concurrency-safe handling for discovery dismiss/spark mutation sequence.
6. Clarify DTO philosophy boundaries (what data is intentionally not exposed to avoid urgency mechanics).
7. Trim/align documentation so engineering reality and launch posture are unambiguous.

This sequence preserves momentum: **stabilize critical foundations first, simplify drift vectors second, continue feature work third.**

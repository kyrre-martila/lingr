# Run 7 Review — Calm Chat Implementation

## 1) Summary
Run 7 makes meaningful progress toward a calm-chat foundation across backend contracts, persistence, and service wiring, and it succeeds on several non-negotiables: no online status surface, no typing indicators, no read receipts, no last seen, and no per-message timestamps in the implemented UI stream.

That said, implementation and documentation are **not fully aligned** yet. The most significant gap is the plus-menu behavior: the code currently opens a direct “Playing now” composer from `+` instead of the documented two-level menu (`Apps`, `Playing now`, with nested app/media options). This is a product-contract mismatch and should be stabilized before further feature expansion.

Overall assessment: **good foundation, medium stabilization quality, requires UI contract alignment and a few backend boundary hardening steps before considering this run complete.**

---

## 2) What is working well

1. **Shared contract vocabulary is clean and reusable**
   - Message types, visibility, delivery states, app IDs, and media types are centralized in `packages/shared/src/contracts.js` with lightweight runtime guards.
   - This is a strong anti-drift move between backend and frontend.

2. **Viewer-scoped backend access is in place for conversations/messages**
   - Conversation listing, read-by-id, timeline listing, and send all require authenticated viewer identity.
   - Participant checks are present for conversation/message access, reducing cross-user leakage risk.

3. **DTO mapping boundary is explicit**
   - API returns prefixed external IDs (`cnv_`, `msg_`, `usr_`, `spk_`) and avoids returning raw DB rows directly.
   - `senderUserId` nullable behavior for system messages is represented.

4. **Persistence foundation is coherent for MVP chat domain**
   - Dedicated tables and enums for `conversations`, `conversation_participants`, and `messages` with relevant indexes and FKs.
   - Unique `sparkId` on conversations encodes one conversation per Spark relationship.

5. **Calm interaction constraints are mostly respected in message rendering**
   - UI does not render per-message times.
   - No visible typing/presence/receipt UI in the conversation stream implementation.

---

## 3) Main architecture concerns

1. **Spec-vs-implementation drift on plus-menu architecture**
   - Docs specify a two-level menu system opened from `+` with `Apps` and `Playing now`; implementation currently opens only a Playing now composer sheet.
   - This introduces immediate drift risk for future app invite wiring and testing assumptions.

2. **System-role participant model exists, but sender policy not enforced**
   - `ConversationParticipantRole` includes `system`, and message schema allows nullable sender.
   - `sendConversationMessage` currently always sets `senderUserId` to viewer and does not enforce a policy boundary for system-originated rows (should likely be service-internal only).

3. **Conversation state lifecycle is under-defined**
   - `active|paused|closed` exists contractually, but there is no explicit transition matrix equivalent to Spark’s improved state governance.
   - Current model seeds from Spark status at create time but does not define later synchronization/transition ownership.

---

## 4) Persistence concerns

1. **JSON payload flexibility is useful, but weakly constrained at DB boundary**
   - `messages.content` and `messages.metadata` are JSONB with no DB-level typed constraints.
   - App-layer validation helps, but invalid historical rows remain possible if alternate write paths appear.

2. **Timeline pagination cursor validity is not conversation-bound**
   - Cursor parsing validates format (`msg_` prefix) but does not verify cursor membership in the same conversation before use.
   - In practice this may cause confusing pagination behavior if a valid message ID from another conversation is provided.

3. **No explicit immutability rule for message content post-create**
   - Schema has `updatedAt`, which suggests future edits are possible, but no documented calm-chat policy about editable messages/system rows yet.

---

## 5) API/service concerns

1. **`app_invite` validation is too permissive**
   - Shared contracts define canonical app IDs (`match_cards|guess_me|snuggle`), but payload validation only checks non-empty string.
   - This creates API-contract looseness and drift risk.

2. **`system` message payload allows any text but no tone enforcement**
   - Data-model addendum describes warm/gentle guidance; service only validates non-empty text.
   - If tone constraints are important philosophically, they currently rely on caller discipline.

3. **Conversation creation race behavior is not explicitly handled**
   - Service checks `findUnique` then `create`; unique `sparkId` protects DB, but conflict mapping for concurrent creates is not explicit.
   - A P2002 mapping similar to Spark duplicate mapping would improve deterministic API outcomes.

4. **Messages list ordering vs append behavior mismatch risk in frontend**
   - API returns newest-first ordering (`createdAt desc`), while frontend appends newly sent messages to the end of current array.
   - Depending on UI expectations, this may cause ordering inconsistency after mixed fetch/send flows.

---

## 6) Frontend/UX concerns

1. **Plus-menu requirements are not met yet (high-priority)**
   - Required first-level entries (`Apps`, `Playing now`) are not implemented in UI.
   - Required nested structure (Apps → Match Cards/Guess Me/Snuggle, Playing now → Song/Movie/TV Series) is also not surfaced via menu navigation.

2. **Playing now flow is partially implemented, but not through required menu hierarchy**
   - Good: supports Song, Movie, TV Series through media type select and sends `playing_now` payload.
   - Gap: access path bypasses required root/submenu information architecture.

3. **Conversation list still reflects non-calm metadata fields from mock-era structure**
   - There are remnants in mocks/state around `updatedAt`, `unread`, and timing-like fields in legacy data structures.
   - Even if no longer rendered as pressure mechanics, this increases accidental reintroduction risk.

4. **Layer unlock presentation is mostly subtle but CTA affordance is text-only**
   - Visual tone is gentle; however, CTA displayed as plain text may be confusing for interaction expectations.
   - If intentionally non-interactive for now, that should be explicit in UX notes.

---

## 7) Accessibility concerns

1. **Good baseline semantics in implemented controls**
   - Buttons and labels are present for compose/send and playing-now fields.

2. **Missing declared dialog semantics for opened composer sheet**
   - The sheet UI acts like an overlay panel but lacks explicit `role="dialog"`, accessible name linkage, and focus management/trap behavior.
   - Escape-to-close behavior documented in notes is not visible in this implementation.

3. **Potential screen-reader ambiguity in dynamic content updates**
   - New messages and sheet toggles do not appear to use live regions or announcement patterns, which may reduce accessibility clarity for async updates.

---

## 8) Contract consistency concerns

1. **Strong consistency in core enums/types**
   - Shared contracts, data-model addendum, and backend schema align on message/conversation vocabulary.

2. **Implementation mismatch for plus-menu structure contract**
   - Wireframe and run notes require explicit hierarchy; frontend currently implements a single direct playing-now sheet.

3. **`app_invite` contract not enforced end-to-end**
   - Contract specifies explicit app IDs; backend validator does not enforce enumerated values.

4. **`layer_unlock` payload shape alignment is acceptable**
   - Title/subtitle/CTA label are represented and rendered as subtle system banner rows.

---

## 9) Lingr philosophy concerns

1. **Absence of pressure mechanics is mostly upheld in current surface**
   - No online status, typing indicators, read receipts, last seen, or per-message timestamps in presented chat UI.

2. **Potential pressure reintroduction risk from legacy data semantics**
   - Old mock-era fields such as `nextPromptAt` and timing descriptors still exist in mock data sources.
   - Even if not actively shown in new flow, they conflict with strict calm-chat constraints if resurfaced.

3. **Layer unlock is directionally subtle, non-gamified**
   - Current rendering is informational and gentle, with no counters/streak framing.
   - Maintain caution to keep copy neutral and non-achievement oriented.

---

## 10) Suggested stabilization plan

### Phase A — Contract/UI alignment (P0)
1. Implement the exact plus-menu hierarchy required by spec:
   - Root: `Apps`, `Playing now`
   - Apps submenu: `Match Cards`, `Guess Me`, `Snuggle`
   - Playing now submenu: `Song`, `Movie`, `TV Series`
2. Keep all leaf actions skeleton-safe (no new external integration) unless already planned.
3. Add focused UI tests for menu visibility, hierarchy, and keyboard behavior.

### Phase B — Service boundary hardening (P0/P1)
1. Enforce `APP_INVITE_APP_ID` in backend payload validation.
2. Add explicit conflict mapping for conversation create unique collisions.
3. Add cursor conversation-scope guard for message pagination inputs.

### Phase C — Accessibility and calm UX hardening (P1)
1. Add dialog semantics and focus handling for composer sheets/menus.
2. Add Escape close and focus return behavior consistently.
3. Add non-invasive SR announcements for critical async state changes.

### Phase D — Philosophy guardrails (P1/P2)
1. Remove or quarantine legacy pressure-adjacent mock fields from active conversation data paths.
2. Add conformance checks ensuring no presence/typing/seen/timestamp surfaces are introduced in web chat components.

---

## 11) Prioritized next steps

### P0
1. Align frontend `+` menu to required root/submenu hierarchy (without adding new product functionality beyond navigation skeleton).
2. Add tests asserting exact menu tree and hidden-by-default behavior.
3. Enforce `app_invite.appId` enum values at API boundary.

### P1
1. Add accessibility semantics/focus management for the menu/sheet container.
2. Add deterministic conversation-create conflict handling for concurrent requests.
3. Add cursor scope validation for timeline pagination.

### P2
1. Clean legacy mock data fields that imply urgency/timing pressure from active paths.
2. Add explicit conversation state transition policy documentation/tests.

# Run 12 Prompt 2 — Safety & Moderation MVP Hardening Review

## Issues found
- Safety reason codes were inconsistent with calm product wording (`safety.user_blocked`, `safety.paused_for_safety`) and not aligned to requested canonical terms.
- Message-history retrieval was incorrectly blocked on paused conversations (duplicate pause checks in `listConversationMessages`).
- Safety enforcement was incomplete for message sending and chat-app actions when users were blocked after conversation creation.
- Minor duplication/quality issue: duplicate `if (!existing)` guard in `completeSnuggleSession` remains pre-existing and non-blocking.
- Root workspace does not define `lint`, `typecheck`, or `test` scripts; validation commands must be run via existing package-level/test-runner commands.

## Fixes made
- Added calm canonical safety reason codes and mapped block code to interaction restriction.
- Standardized block and pause enforcement errors to:
  - `safety.interaction_restricted`
  - `safety.conversation_paused`
- Removed pause-gate from message history listing so paused conversations remain readable.
- Added reciprocal block enforcement to message send and chat-app entry/transition paths.
- Added/updated targeted tests for:
  - duplicate block idempotency (already present and retained)
  - block prevents spark creation
  - block prevents message sending
  - block prevents chat app action
  - report persistence + moderation event (already present and retained)
  - pause prevents message sending
  - pause blocks chat app actions (covered by existing chat-app safety gate tests + updated reason semantics)
  - paused conversation history remains retrievable

## Files changed
- `packages/shared/src/contracts.js`
- `apps/api/src/services/safety-service.js`
- `apps/api/src/services/conversation-service.js`
- `apps/api/src/services/chat-app-service.js`
- `apps/api/test/safety-service.test.js`
- `apps/api/test/spark-service.test.js`
- `apps/api/test/conversation-service.test.js`
- `apps/api/test/chat-app-service.test.js`

## Tests added/updated
- Updated safety reason-code assertions.
- Added explicit blocked-interaction tests across spark/message/chat-app paths.
- Added paused-message-send and paused-history-readable tests.

## Remaining risks
- `UserReport`/`ModerationEvent`/`ConversationSafetyState` schema currently lacks FK constraints to users/conversations by design of current migration; acceptable for MVP but can allow orphan references if upstream data is deleted.
- No dedicated contract conformance test yet for new `REASON_CODES.SAFETY.*` additions across all route surfaces.
- Root-level CI script ergonomics remain minimal (`lint/typecheck/test` not defined at workspace root).

## Smoke confirmation
- ✅ Run 11.7 smoke flow still passes via `npm run e2e:smoke --workspace @lingr/api`.

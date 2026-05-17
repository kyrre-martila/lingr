# Run 7.5 Notes — Frontend/Backend Chat Wiring

## Chat wiring decisions
- Active chat list now resolves through the conversation service boundary, with API client transport selecting HTTP-first for `conversations.*` operations.
- Timeline reads now resolve through backend/API boundary and are normalized to ascending timeline order before render.
- Send flow now routes through backend/API boundary and performs safe optimistic append only for non-empty text, then refetches to confirm final consistency.
- Active chat UI does not read directly from mock conversation arrays.

## Services changed
- `apps/web/src/api/http-transport.js` (new): operation-to-REST mapping for:
  - `conversations.viewer.list` → `GET /v1/conversations/viewer`
  - `conversations.messages.list` → `GET /v1/conversations/:conversationId/messages`
  - `conversations.messages.send` → `POST /v1/conversations/:conversationId/messages`
- `apps/web/src/api/client.js`: default transport is HTTP-first for conversation operations, with isolated mock fallback on transport failure.
- `apps/web/src/components/conversations/index.js`:
  - loads conversation list via service boundary
  - loads timeline via service boundary
  - sends text via service boundary
  - optimistic append + rollback on failure
  - refetch after successful send for consistency
  - explicit auth/permission/validation/retryable messaging

## Mock dependencies removed or deferred
- Removed active-chat direct dependency on UI-owned mock conversation data.
- Mock transport remains only as an isolated fallback boundary when HTTP conversation operations are unavailable/failing (documented in `createDefaultTransport`).

## Transport behavior
- Conversation operations are routed through HTTP transport first.
- If HTTP returns a non-success envelope or transport failure, client falls back to mock transport for continuity in local/demo contexts.
- Non-conversation operations continue using existing mock transport behavior unchanged.

## Error states handled in send flow
- Loading: local `sending` state prevents duplicate sends.
- Success: optimistic row replaced by server-confirmed row, then timeline refetch.
- Validation error: “Please enter a message before sending.”
- Auth error: “Your session has expired. Please sign in again.”
- Permission error: “You cannot send messages in this conversation right now.”
- Retryable/domain error: “Temporary send issue. Please retry.”

## Tests/checks added
- Added `apps/web/test/http-transport.test.js`:
  - verifies conversation list REST mapping
  - verifies canonical send body mapping (`{ type: 'text', content: { text } }`)

## Remaining risks
- HTTP transport currently has no session/header integration, so authenticated API calls depend on environment-level auth wiring not implemented in this run.
- Mock fallback can hide backend failures in local demo mode; acceptable for this run but should be tightened once auth/session transport is finalized.
- No realtime sync in scope; consistency is maintained via post-send refetch.

## Manual testing checklist
- [ ] Open conversation list and verify initial load comes from service/API boundary.
- [ ] Open a conversation and verify timeline fetch path uses backend/API boundary.
- [ ] Send valid text and verify optimistic append then stable timeline after refetch.
- [ ] Send empty text and verify validation message.
- [ ] Simulate auth failure and verify auth error message.
- [ ] Simulate permission failure and verify permission error message.
- [ ] Simulate retryable send failure and verify retry prompt.
- [ ] Verify layer unlock/system rows still render with `senderUserId: null`.
- [ ] Verify timeline remains ascending after fetch and after send.
- [ ] Verify no typing/online/read-receipt/last-seen/per-message-time mechanics appear.

## Local run/test commands
- `pnpm --filter @lingr/web test`
- `pnpm --filter @lingr/api test`
- `pnpm --filter @lingr/web dev`
- `pnpm --filter @lingr/api dev`

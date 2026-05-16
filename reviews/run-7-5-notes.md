# Run 7.5 Notes — Calm Chat Stabilization

## Files changed
- `apps/web/src/data/mocks/conversations.js`
- `apps/web/src/api/mock-transport.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/test/conversation-guardrails.test.js`
- `apps/api/src/services/conversation-service.js`
- `apps/api/test/conversation-service.test.js`
- `reviews/run-7-5-notes.md`

## Pressure fields removed
Removed pressure/timing mechanics from active conversation mock data path:
- conversation-level: `updatedAt`, `unread`, `nextPromptAt`
- message-level: `time`
- safety timing metadata: `messageIntervalHours`, `preferredResponseWindowHours`

## System sender decisions
- Treated `system` and `layer_unlock` as system-originated message types.
- System-originated rows map to `senderUserId: null`.
- Viewer send endpoint now rejects system-originated message types (`permission.not_allowed`) to prevent client-side spoofing.

## Message ordering decision
- Timeline list endpoint now returns messages in ascending `createdAt` order.
- Frontend append-after-send behavior remains consistent with ascending order.

## app_invite validation changes
- Preserved canonical app invite validation (`match_cards | guess_me | snuggle`) at API boundary.
- Invalid values continue returning canonical reason code `message.invalid_payload_by_type`.

## Placeholder media decision
- Removed `placeholder://` persistence behavior from `playing_now` send path in mock transport.
- Poster URL is now `null` when no concrete URL is supplied.

## layer_unlock CTA decision
- If `ctaLabel` and `ctaRoute` are both present, CTA now renders as a real anchor action.
- If only `ctaLabel` exists, it remains non-interactive text.
- MVP mock data now provides a route for the layer unlock CTA.

## Tests/checks added
- Guardrail test: no pressure fields in active conversation mock data.
- Guardrail test: system/layer_unlock sender maps to `null`.
- Guardrail test: `placeholder://` is not persisted.
- Guardrail check: layer unlock CTA rendering path includes actionable link when route exists.
- API test: timeline query ordering uses ascending `createdAt`.
- API test: viewer send rejects system-origin message types.
- Existing API test retained: app_invite rejects invalid app IDs.

## Issues intentionally deferred
- No realtime messaging.
- No typing indicators, online state, read receipts, last seen, per-message timestamps.
- No redesign of frontend.
- No additional product features beyond stabilization guards.

## Manual testing checklist
- [ ] Open conversations and verify no timestamp-style pressure labels appear from active mock data.
- [ ] Verify layer unlock row appears as a subtle system row and CTA is actionable when present.
- [ ] Verify sending a playing-now card without poster URL returns `posterUrl: null`.
- [ ] Verify API timeline messages are returned in ascending chronological order.
- [ ] Verify `app_invite` rejects non-canonical `appId` values.
- [ ] Verify user cannot send `system` or `layer_unlock` as viewer-originated messages.

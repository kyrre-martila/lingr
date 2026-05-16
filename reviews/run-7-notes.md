# Run 7 Notes — Calm Chat Documentation Alignment

## Documentation updated
- Updated `README.md` to make calm, low-pressure chat the default early connection experience.
- Updated `docs/AI_GUIDE.md` with explicit chat philosophy constraints and implementation guardrails.
- Updated `docs/data_model.md` with message-type vocabulary and pressure-free display constraints.
- Added `DEVELOPMENT_PLAN.md` with Run 7 documentation-first direction and deferred implementation scope.
- Added `wireframe-spec.md` describing default chat layout and + menu structure.
- Added `data-model.md` addendum for chat message typing and payload guidance.

## Philosophy decisions documented
- Chat should feel calm, low-pressure, warm, intentional, and familiar enough to feel natural.
- Chat must avoid online status, typing indicators, last seen, read receipts, per-message timestamps, urgency mechanics, and addictive loops.
- Early connection should be normal chat first; depth should emerge later.

## Message types documented
- `text`
- `system`
- `layer_unlock`
- `playing_now`
- `app_invite`

## Chat UX decisions documented
- Default chat: clean interface, subtle Lingr styling, no pressure mechanics.
- Composer: plus (+) button at bottom-left.
- Plus first level: Apps and Playing now.
- Apps list: Match Cards, Guess Me, Snuggle.
- Playing now list: Song, Movie, TV Series.
- Playing now shares as lightweight in-chat cards representing current interests.

## Window direction update
- Window is no longer the early chat experience.
- Window is a later-stage, more exclusive mutual deepening concept.
- Principle: chat is normal first, deeper later.

## Deferred chat concerns
- No backend chat implementation yet.
- No frontend chat implementation yet.
- No realtime messaging mechanics yet.
- No notification-pressure strategy implementation yet.
- No final moderation/event policy integration yet.

## Manual review checklist
- [ ] Confirm all docs align on calm/low-pressure chat principles.
- [ ] Confirm all docs list the same disallowed chat mechanics.
- [ ] Confirm + menu hierarchy matches: Apps / Playing now.
- [ ] Confirm submenu items match exact app/media categories.
- [ ] Confirm message type vocabulary is consistent across docs.
- [ ] Confirm Window positioning is later-stage in every file.
- [ ] Confirm no file suggests implementing features in this run.

## Contracts introduced (this update)
- Added shared conversation contracts in `packages/shared/src/contracts.js`:
  - conversation states: `active | paused | closed`
  - conversation participant role: `member | system`
  - conversation DTO field expectations for client-safe API responses.
- Added shared message contracts:
  - message type vocabulary: `text | system | layer_unlock | playing_now | app_invite`
  - message visibility: `conversation | soft_banner`
  - minimal delivery states: `queued | sent | failed`
- Added typed payload guidance constants:
  - playing now media types: `song | movie | tv_series`
  - app invite app IDs: `match_cards | guess_me | snuggle`
  - canonical DTO shape docs for playing now and layer unlock payloads.
- Added lightweight runtime guards for message type, visibility, delivery state, and playing now media type.

## DTO decisions
- Message DTO is designed to be transport-agnostic and mobile-reusable.
- Message DTO includes `content` as typed payload + optional `metadata` for client-safe hints.
- Conversation DTO includes linked `sparkId` and participant IDs for stable future backend integration.
- Kept IDs prefix-oriented (`cnv_*`, `msg_*`, `usr_*`, `spk_*`) in field expectations only; no persistence coupling introduced.

## Message payload decisions
- `playing_now` payload supports media type, title, optional creator, optional cover/poster placeholder URL, and optional short context.
- `layer_unlock` payload supports subtle banner content (`title`, optional `subtitle`, optional CTA label/route).
- `system` and `text` remain intentionally small and readable.

## Intentionally excluded features
- No typing indicators contracts.
- No online presence contracts.
- No read receipts / seen states contracts.
- No urgency mechanics or pressure loops.

## Deferred concerns
- No database schemas or migrations for conversation/message persistence yet.
- No websocket/realtime delivery semantics yet.
- No API endpoint implementation yet.
- No frontend rendering redesign in this run.
- No notification/ranking pressure mechanics.

## Manual testing checklist
- [ ] Verify all supported message types serialize with canonical payload keys.
- [ ] Verify `isSupportedMessageType` accepts only the five approved types.
- [ ] Verify playing now payload accepts only `song | movie | tv_series` media type values.
- [ ] Verify layer unlock payload shape can represent subtle banner text + optional CTA.
- [ ] Verify no contract introduces typing/presence/read-receipt fields.
- [ ] Verify DTO field expectations are consistent between `contracts.js` and `data-model.md`.

## Run 7 — Persistence foundation implemented

### Persistence decisions
- Added first persisted calm-chat entities: `conversations`, `conversation_participants`, and `messages`.
- Kept persistence intentionally transport-agnostic and DTO-first to preserve mobile reuse and avoid internal-row leakage.
- Bound each conversation to exactly one Spark (`sparkId` unique) as the relationship gate.

### Schema/migration decisions
- Added Prisma enums for conversation state/roles and message type/visibility/delivery state.
- Added new Prisma models for Conversation, ConversationParticipant, and Message.
- Added migration `0005_conversation_message_persistence` to create tables, enums, indexes, unique constraints, and FKs.

### Endpoints/services created
- Added conversation service with viewer-scoped methods:
  - list viewer conversations
  - get viewer conversation by id
  - create conversation from eligible Spark
- Added message methods:
  - list conversation timeline with pagination-ready `items + page.nextCursor`
  - send message
- Added routes:
  - `GET /v1/conversations/viewer`
  - `GET /v1/conversations/:conversationId`
  - `POST /v1/conversations`
  - `GET /v1/conversations/:conversationId/messages`
  - `POST /v1/conversations/:conversationId/messages`

### DTO mapping decisions
- Added strict DTO mappers for conversations and messages.
- IDs are API-prefixed (`cnv_`, `msg_`, `usr_`, `spk_`) at the boundary.
- Internal DB entities are never returned directly.

### Validation decisions
- Conversation creation requires an authenticated participant of a valid Spark in `accepted|paused`.
- Message send/list requires conversation participation.
- Message type validation uses shared contract support list.
- Invalid message type returns canonical `message.invalid_type`.
- Type-specific payload validation returns `message.invalid_payload_by_type`.
- `playing_now` payload persists `song|movie|tv_series` with minimal required fields.

### Auth assumptions
- Anonymous users cannot create/list/read conversations or messages.
- All conversation/message access is viewer-scoped participant access.
- Service-level auth checks remain layered with route guards.

### Deferred work
- No realtime delivery.
- No notifications.
- No typing indicators / online status / read receipts.
- No conversation lifecycle transition matrix beyond Spark-linked create-time state seed.
- No external media integrations.

### Local test commands
- `pnpm --filter @lingr/api test`
- `pnpm --filter @lingr/api prisma migrate dev`

### Manual testing checklist
- [ ] Create conversation from accepted Spark as participant succeeds.
- [ ] Create conversation from non-participant or invalid Spark fails with canonical reason.
- [ ] Anonymous calls to conversation/message endpoints fail with auth reason.
- [ ] Only participants can list conversation timeline and send messages.
- [ ] Sending unsupported `type` returns `message.invalid_type`.
- [ ] Sending invalid payload per type returns `message.invalid_payload_by_type`.
- [ ] `playing_now` persists and returns valid `song|movie|tv_series` payloads.
- [ ] Timeline response shape includes `items` and `page.nextCursor`.

## Run 7 — Calm chat input + plus-menu skeleton implemented

### UI components added
- Added a new calm composer row in web chat UI with:
  - left-aligned `+` button,
  - central message field,
  - right-aligned send button.
- Added a reusable in-composer bottom-sheet-style menu container (`composer-sheet`) rendered from structured menu data.
- Added first-level menu items:
  - Apps
  - Playing now
- Added second-level menu structures:
  - Apps → Match Cards, Guess Me, Snuggle
  - Playing now → Song, Movie, TV Series

### Interaction decisions
- `+` toggles the calm menu open/closed without sending or mutating chat payloads.
- Menu hierarchy is data-driven (`menuData`) to keep future app wiring simple and non-invasive.
- Selecting a first-level item with children navigates to a submenu in place.
- Submenu includes an explicit Back action to return to root menu.
- Selecting leaf menu items is currently no-op by design (skeleton only, no external integration).
- Focusing the message field closes the menu to reduce visual pressure and keep composing flow simple.

### Accessibility notes
- `+` uses `aria-haspopup="dialog"`, `aria-controls`, and `aria-expanded` to expose menu state.
- Menu container uses `role="dialog"` with a calm-label for assistive tech.
- Keyboard support:
  - Enter/Space on buttons works via native button semantics.
  - Escape closes the menu and returns focus to the `+` trigger.
- Input and actions respect existing disabled state when messaging is unavailable/paused.
- Focus-visible and contrast-conscious styles were added for menu actions and composer controls.

### Deferred app functionality
- No app launch, share posting, backend calls, or external integrations were added.
- No payload dispatch for app/media picks yet.
- No change to message stream semantics for app cards in this run.
- Typing indicators, online status, read receipts, and per-message timestamps remain out of scope for this implementation.

### Manual testing checklist
- [ ] Verify composer shows `+`, message field, and send button in calm aligned layout.
- [ ] Verify `+` opens first-level menu with exactly: Apps, Playing now.
- [ ] Verify Apps opens submenu with exactly: Match Cards, Guess Me, Snuggle.
- [ ] Verify Playing now opens submenu with exactly: Song, Movie, TV Series.
- [ ] Verify Back returns from submenu to root menu.
- [ ] Verify Escape closes menu and refocuses `+`.
- [ ] Verify focusing the message field closes menu.
- [ ] Verify disabled composer states still disable interactions.
- [ ] Verify no app/media selection triggers external integration or network behavior.

## Run 7 — Frontend conversation service-boundary integration

### Frontend integration decisions
- Rewired web conversation UI to load viewer conversations asynchronously through a service/API function (`listViewerConversations`) instead of directly relying on UI-owned mock arrays.
- Rewired message timeline loading to the service/API boundary (`listConversationMessages`) with explicit loading, success, permission error, and retryable error rendering paths.
- Rewired text send action to service/API boundary (`sendConversationMessage`) with validation and permission-aware feedback.
- Preserved calm chat presentation: no typing indicators, no online state, no read receipts, no last seen, no per-message timestamps.
- Kept mobile-first and accessible controls in place: semantic buttons, labels, and quiet error messaging.

### Service/API boundary changes
- Added frontend conversation service methods:
  - `listViewerConversations()`
  - `listConversationMessages({ conversationId })`
  - `sendConversationMessage({ conversationId, text })`
- Expanded mock transport operation support for boundary-aligned operations:
  - `conversations.viewer.list`
  - `conversations.messages.list`
  - `conversations.messages.send`
- Kept component transport-agnostic by consuming only service functions and async envelope results.

### Files changed
- `apps/web/src/services/conversations-service.js`
- `apps/web/src/api/mock-transport.js`
- `apps/web/src/components/conversations/index.js`
- `reviews/run-7-notes.md`

### Error states handled
- Loading states:
  - viewer conversations list load
  - message timeline load
- Success states:
  - conversations render
  - timeline render
  - send success appends bubble
- Validation error state:
  - empty/invalid text message returns gentle inline validation message
- Permission error state:
  - unavailable/paused conversation returns clear non-retry guidance
- Retryable error state:
  - retryable timeline failures expose a Retry action
  - retryable send failures return non-urgent retry guidance

### Remaining mock coupling
- Transport still defaults to in-memory mock transport in web app (`createMockTransport`) until live HTTP transport wiring is introduced.
- Mock transport currently simulates DTO-like conversation/message responses and selected failure modes for integration completeness.
- Conversation header metadata still uses mock profile fields for display warmth.

### Manual testing checklist
- [ ] Open conversations section and confirm initial loading placeholders appear before data.
- [ ] Confirm conversation list loads via service and selecting another conversation re-fetches timeline.
- [ ] Confirm timeline loads through service and displays message bubbles without timestamps.
- [ ] Confirm no typing indicator, online status, read receipts, or last seen are displayed.
- [ ] Submit empty message and verify validation error copy is shown.
- [ ] Open paused conversation and verify send is disabled/blocked as permission behavior.
- [ ] Trigger retryable send mock by sending text containing `[retryable-error]` and verify gentle retry guidance.
- [ ] Trigger timeline permission case (mock conversation `c3`) and verify unavailable messaging state.
- [ ] Verify calm Lingr styling remains and mobile-first layout is unchanged.

## Run 7 — Playing now calm chat card message type

### Playing now implementation decisions
- Implemented Playing now as a message-card type rendered in the existing timeline stream without redesigning layout structure.
- Kept transport swappable by sending through the existing `conversations.messages.send` operation via service boundary (`sendConversationPayloadMessage`).
- Kept entry flow manual-input only: plus button opens a lightweight inline composer with no external search or provider integration.

### Message payload decisions
- Uses shared `playing_now` type and shared media values: `song | movie | tv_series`.
- Payload shape sent through service boundary:
  - `mediaType` (required)
  - `title` (required)
  - `creator` (optional)
  - `posterUrl` (optional)
  - `context` (optional)
- If poster URL is omitted in mock mode, a placeholder URI is generated so card rendering can still show an artwork hint.

### UI rendering decisions
- Playing now renders as a warm, calm card variant in timeline:
  - subtle “Playing now · {media type}” lead text
  - title-forward display
  - optional creator/context/poster hint rows
- Card remains conversational (single message in stream) and does not write to profile or preference surfaces.
- Preserved mobile-first behavior by reusing existing composer stack and message stream structure.

### Validation and error handling
- Manual composer validates at transport boundary:
  - requires valid `mediaType`
  - requires non-empty `title`
- Validation errors map to gentle inline copy in composer.
- Permission and retryable/general failures map to existing calm error messaging behavior.
- Text-message flow validation remains unchanged.

### Deferred external integrations
- No Spotify integration.
- No Apple Music integration.
- No TMDB integration.
- No IMDb integration.
- No artwork/provider lookup integration.
- No search API integration (manual input / placeholder behavior only).

### Manual testing checklist
- [ ] Open a conversation and use `+` to open the Playing now composer.
- [ ] Share a Song card with title only and verify it appears as a timeline card.
- [ ] Share a Movie card with creator and context and verify optional fields render.
- [ ] Share a TV Series card without poster URL and verify placeholder hint behavior.
- [ ] Submit Playing now without title and verify validation error copy is shown.
- [ ] Verify paused/unavailable conversation blocks Playing now sharing with permission copy.
- [ ] Verify regular text sending still works unchanged.
- [ ] Verify no likes, reactions, counters, timestamps, typing indicators, or read receipts appear.

## Run 7 — `layer_unlock` subtle timeline system message

### Layer unlock implementation decisions
- Implemented frontend rendering for message type `layer_unlock` in the conversation timeline as a dedicated calm system banner, without changing broader chat layout.
- Render path reuses the existing message stream and message service boundary response shape (`type`, `content`, `visibility`, `senderUserId`) rather than introducing a new transport path.
- Banner is non-blocking and informational only; it does not trigger progression logic, gating, or any urgency/reward loops.

### Message payload decisions
- Consumed shared Run 7 payload keys for `layer_unlock`:
  - `title` (required display line)
  - `subtitle` (optional supporting line)
  - `ctaLabel` (optional soft right-side hint)
- Did not expose internal layer depth/index/state fields in UI payload rendering.
- In mock transport DTO mapping, `layer_unlock` rows are emitted as:
  - `senderUserId: null`
  - `visibility: soft_banner`
  to align with shared message contract intent for subtle system rows.

### UI rendering decisions
- Added `layer_unlock` branch in bubble renderer that outputs a centered, warm, low-contrast card in the timeline.
- Visual treatment uses soft background, subtle border, compact spacing, and restrained typography to match Lingr’s calm palette.
- Added decorative icon with `aria-hidden="true"`; text remains semantic paragraph content.
- CTA label is rendered as quiet text only (no urgent button behavior) to preserve low-pressure tone.
- Mobile-first preserved via existing message stream flow and max-width constraints; no desktop-only dependency introduced.

### Deferred Layers logic
- No progression engine or unlock condition rules were implemented.
- No backend unlock trigger orchestration was added.
- No route navigation for `ctaRoute` was introduced in this run.
- No gamified language, milestones, or reward mechanics were added.

### Manual testing checklist
- [ ] Verify timeline renders `layer_unlock` rows when API/mock message type is `layer_unlock`.
- [ ] Verify `layer_unlock` card displays `title` and optional `subtitle`/`ctaLabel` only when present.
- [ ] Verify `layer_unlock` rows remain subtle and centered across narrow/mobile widths.
- [ ] Verify `senderUserId: null` for `layer_unlock` does not break timeline rendering.
- [ ] Verify non-`layer_unlock` messages (`text`, `playing_now`) render unchanged.
- [ ] Verify no new timestamps/read receipts/presence/typing indicators were introduced.

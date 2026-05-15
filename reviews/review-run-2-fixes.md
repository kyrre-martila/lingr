# Run 2 Fixes — Stabilization Pass

## Files changed
- `apps/web/src/main.js`
- `apps/web/src/state/route-access.js`
- `apps/web/src/state/session.js`
- `apps/web/src/state/index.js`
- `apps/web/src/state/onboarding.js`
- `apps/web/src/state/glimps.js`
- `apps/web/src/state/discovery.js`
- `apps/web/src/state/conversations.js`
- `apps/web/src/state/ui-preferences.js`
- `apps/web/src/data/mocks/index.js`
- `apps/web/src/components/not-found.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/src/components/discovery.js`
- `apps/web/src/styles/main.css`

## Issues fixed
1. Added explicit route guard operating modes (`prototype_open`, `enforced`) with a deterministic guard-evaluation helper that returns allowed/blocked, reason, and suggested redirect.
2. Kept default behavior prototype-open so current prototype navigation is not blocked.
3. Replaced unknown-route silent fallback with a dedicated not-found view and a clear path back to `/`.
4. Improved conversation-list semantics by removing listbox/option roles and using list + button semantics.
5. Reduced unnecessary tab stops by removing `tabIndex=0` from message bubbles.
6. Replaced discovery pacing indicator `progressbar` semantics with list/status-style semantics.
7. Split global state bucket into domain modules (`session`, `discovery`, `conversations`, `onboarding`, `glimps`, `ui-preferences`) while keeping a lightweight index aggregator.
8. Standardized mock data lifecycle by introducing shared snapshot accessors to avoid render-time data creation in discovery/conversations.

## Issues intentionally deferred
- No real authentication or backend enforcement added.
- No route-intent redesign or route-structure changes.
- No visual redesign beyond minimal semantics-safe structure updates.
- No full keyboard roving/arrow model for conversation chooser (semantics simplified instead).

## Route guard architecture notes
- `evaluateRouteGuard({ path, sessionState, mode })` is the central policy decision function.
- Guard mode defaults to `prototype_open` to preserve current product behavior.
- `enforced` mode is implemented and can be enabled later to activate blocking.
- Guard output includes:
  - route known/unknown
  - allowed vs blocked
  - blocked reason
  - suggested redirect target
  - route access and intent metadata

## Accessibility changes made
- Conversation list now uses standard list semantics with interactive buttons instead of incomplete listbox semantics.
- Message bubbles are no longer individually tabbable.
- Discovery pacing track no longer advertises itself as a progressbar; it now renders as a descriptive list.

## State/data organization changes
- State ownership split into domain files under `state/`.
- `state/index.js` now acts as an aggregator only.
- Added `data/mocks/index.js` as a single snapshot source for discovery and conversations mock payloads.
- Components consume snapshot data rather than creating mock data during each render.

## Manual testing checklist
- [ ] Visit `/` and verify landing page renders normally.
- [ ] Visit `/onboarding`, `/discovery`, `/conversations`, `/profile` and verify current prototype access still works.
- [ ] Visit an unknown route (example `/does-not-exist`) and verify not-found page appears with a back-to-home action.
- [ ] In conversations, verify list item selection still updates active thread.
- [ ] Tab through conversations page and verify message bubbles are skipped from tab order.
- [ ] On discovery page, verify pacing indicator still visually represents used/open slots and reads as descriptive content.
- [ ] Verify mobile header/nav interactions still behave as before.

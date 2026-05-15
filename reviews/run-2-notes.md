# Run 2 Notes — Route-Level App Structure

## Files changed
- `apps/web/src/routes.js`
- `apps/web/src/state/session.js`
- `apps/web/src/state/route-access.js`
- `apps/web/src/components/app-shell.js`
- `apps/web/src/main.js`
- `reviews/run-2-notes.md`

## Route access architecture decisions
- Kept all access logic frontend-only and mock-session based.
- Added a centralized route access layer (`state/route-access.js`) so route intent/access behavior is not scattered in page/render components.
- Preserved current prototype behavior: no hard auth redirects are enforced yet.
- Continued using “future guard hint” messaging on app pages to make future protected-route behavior explicit without blocking.

## Route metadata added
- Expanded route metadata in `routes.js` with:
  - `access` classification (`public`, `onboarding`, `app`, `protected-future` reserved)
  - `intent` classification (`public`, `onboarding`, `app`)
  - `showInPrimaryNav` flag for lightweight nav control
- Preserved route intent mapping:
  - `/` public
  - `/onboarding` onboarding/public-intent
  - `/discovery` app-intent
  - `/conversations` app-intent
  - `/profile` app-intent

## Helpers created
- `getRouteMeta(path)`
- `getAllowedAccessForSession(sessionState)`
- `canSessionAccessRoute({ path, sessionState })`
- `getFutureGuardStateExpectations(path)`
- `getRouteAccessSummary({ path, sessionState })`
- `getVisibleNavItems({ navItems, sessionState })`
- Updated session helper `getRouteSessionGuardHint` to delegate to centralized route-access summary.

## Navigation behavior updates
- App-shell navigation now derives visible items from centralized route access helpers plus current mock session state.
- Active navigation highlighting remains path-based and unchanged.
- Existing mobile navigation behavior remains intact (menu toggle, Escape handling, close-on-link).

## Future auth replacement notes
- Replace mock session store with real auth session source while preserving helper contracts:
  - Keep route metadata and access mapping structure.
  - Replace `SESSION_STATES` + mock session creation with real auth/account/profile completeness signals.
  - Keep `canSessionAccessRoute` and `getRouteAccessSummary` as stable integration points for future redirects/guards.
- When ready, introduce safe redirects at app entry/router boundary instead of per-component checks.

## Deferred concerns
- No backend/database/auth API integration.
- No login/signup UI.
- No visual redesign.
- No hard redirect enforcement yet.
- No new product features.

## Manual testing checklist
- [ ] Visit `/` and confirm landing stays public/product-focused.
- [ ] Visit `/onboarding` and confirm onboarding flow still works (back/continue/finish).
- [ ] Visit `/discovery` and confirm discovery cards, intro pacing, and CTA behavior render as before.
- [ ] Visit `/conversations` and confirm conversation list/detail switching still works.
- [ ] Visit `/profile` and confirm profile sections/layers render as before.
- [ ] On mobile viewport, open menu, activate each visible route link, and confirm menu closes correctly.
- [ ] On mobile viewport, open menu and press `Escape`; confirm menu closes and focus returns to toggle.
- [ ] Verify navigation highlighting in app-shell routes reflects active route.
- [ ] Verify guard hint note still appears only when current mock session state is outside expected future state for that route.
- [ ] Verify there is no authentication/backend dependency required to render any route.

---

## Run 2 Cleanup Pass — Architecture Stabilization

### Cleanup decisions made
- Extracted route-page composition into `app/route-page.js` so route metadata + guard hint logic has a single home instead of being embedded in `main.js`.
- Extracted app route builder mapping into `app/page-builders.js` to keep `main.js` focused on app bootstrapping and top-level render orchestration.
- Kept existing route paths and behavior unchanged (`/onboarding`, `/discovery`, `/conversations`, `/profile`).
- Preserved existing visuals and accessibility patterns by avoiding template/CSS behavior changes in feature components.

### Files reorganized
- Added `apps/web/src/app/route-page.js`.
- Added `apps/web/src/app/page-builders.js`.
- Simplified `apps/web/src/main.js` imports + responsibilities to reduce architecture drift.

### Dead code removed
- Removed unused legacy mock data module `apps/web/src/components/conversations/mock-data.js` (replaced by canonical `data/mocks/conversations.js` usage already active in conversations feature/state).
- Removed no-longer-needed route page-builder helpers from `main.js` after modularization.

### Deferred architecture concerns
- `discovery.js` and `profile-experience.js` remain relatively large and are candidates for internal subcomponent splits in a future pass.
- Existing state modules still combine both UI preference and feature state in `state/index.js`; a future split by domain is recommended when more app routes are added.
- Full import-path normalization by domain aliases is deferred to avoid introducing bundler/tooling churn before review.

### Recommendations before Run 2 review
- Add lightweight lint rules (unused exports/imports) to prevent reintroduction of dead modules.
- Plan a follow-up “large-file decomposition pass” targeting Discovery and Profile Experience first.
- Introduce a small docs file (`frontend-architecture.md`) that defines folder ownership (`app`, `components`, `state`, `data/mocks`) for contributor consistency.

### Manual testing checklist
- [ ] Visit landing `/` and verify section order/content is unchanged.
- [ ] Visit `/onboarding` and verify onboarding renders with compact app-shell header behavior.
- [ ] Visit `/discovery` and verify discovery pacing/session indicators render unchanged.
- [ ] Visit `/conversations` and verify conversation list/detail switching still works.
- [ ] Visit `/profile` and verify profile cards/sections render unchanged.
- [ ] Use browser back/forward and verify route rendering still responds to `popstate`.
- [ ] With `?mockSession=returning`, confirm route guard hint messaging behavior remains consistent.

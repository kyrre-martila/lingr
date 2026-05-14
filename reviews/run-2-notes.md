# Run 2 Notes — App Shell and Authenticated Layout Architecture

## App shell architecture decisions
- Added a dedicated `createAppShell` renderer that composes a shared authenticated header, shared main container, and shared footer for route-level app surfaces.
- Introduced lightweight route rendering in `main.js` using `window.location.pathname` and `history.pushState` for authenticated routes.
- Kept `/` as a distinct marketing/landing composition with its own navigation links and section stack.
- Applied app shell rendering to `/discovery`, `/conversations`, and `/profile` only.

## Layout primitives introduced
- Added `createPageContainer` for consistent max-width and horizontal rhythm across authenticated pages.
- Added `createPageSection` for semantic page scaffolding with reusable eyebrow, title (`h1`), and lead description support.
- Added app-shell CSS hooks (`app-main`, `app-page-container`, `app-page-section`, `app-page-title`) to centralize page spacing and container behavior.

## Reused vs duplicated components
### Reused
- Existing feature modules were reused without logic rewrites:
  - `createDiscoverySection`
  - `createConversationsSection`
  - `createProfileExperienceSection`
- Existing global `createFooter` reused in both landing and app-shell contexts.
- Existing `createNavigation` upgraded to support configurable item sets and subtle route active states.

### Reduced duplication
- Header/nav composition for authenticated pages moved into `createAppShell`.
- Per-page container and heading spacing moved to primitives instead of repeated route-specific wrappers.

## Deferred improvements
- Migration to semantic path-based links on landing page remains deferred (landing keeps anchor-based in-page navigation).
- Full router abstraction (including nested routes, 404 component, and transition hooks) deferred for a later pass.
- Comprehensive token replacement for remaining raw color literals in older components still deferred.
- No authentication state gating is implemented yet (intentionally out of scope).

## Manual testing checklist
- [ ] Visit `/` and verify landing visuals remain separate from authenticated app shell.
- [ ] Visit `/discovery` and confirm shared app header/mobile nav/footer render correctly.
- [ ] Visit `/conversations` and confirm identical shell spacing/container behavior.
- [ ] Visit `/profile` and confirm identical shell spacing/container behavior.
- [ ] On mobile width, open app nav and verify:
  - [ ] focus moves to first menu item
  - [ ] Escape closes the menu and returns focus to toggle
  - [ ] selecting a route closes menu and navigates
- [ ] Verify active nav state is visible but subtle for current authenticated route.
- [ ] Verify each authenticated page has one clear `h1` and preserves semantic section headings below.
- [ ] Verify keyboard navigation and focus-visible styles are still present on interactive controls.

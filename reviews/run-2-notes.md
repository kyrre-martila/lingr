# Run 2 Notes — Route-Aware Navigation and Page Identity Stabilization

## Navigation changes
- Centralized authenticated route metadata in `apps/web/src/routes.js` so labels and path mappings are not hard-coded repeatedly across shell and pages.
- Expanded authenticated nav coverage to include `/onboarding`, `/discovery`, `/conversations`, and `/profile`.
- Kept calm/stable active-route styling by using subtle background + inset border treatment (no high-contrast redesign), with `aria-current="page"` retained on active links.
- Preserved client-side route navigation (`history.pushState`) and ensured mobile menu closes when a route link is selected.
- Preserved Escape-to-close behavior and focus return to nav toggle when closing via keyboard Escape.

## Page structure changes
- Added a shared route metadata model (eyebrow/title/description) and reused `createPageSection` for all app routes to keep page identity consistent.
- Added `/onboarding` to the app-shell route map with a route-level page header and description.
- Updated onboarding section to support a compact embedded mode so route-level `h1` remains the single primary heading while existing flow logic is reused.
- Ensured app routes (`/onboarding`, `/discovery`, `/conversations`, `/profile`) each have one clear route-level `h1`.

## Accessibility notes
- Active nav state remains semantic via `aria-current="page"`.
- Mobile nav interactions continue to support:
  - focus shift to first menu item when opened
  - Escape to close and return focus to toggle
  - close on route selection
- Onboarding compact mode hides duplicated inner title/subtitle visually and for screen flow (`sr-only`) to prevent heading duplication and preserve route-level hierarchy.

## Deferred issues
- Landing (`/`) still uses in-page anchor navigation and is intentionally not merged into authenticated route nav semantics.
- Full router abstraction (404 route, nested routes, transition lifecycle hooks) remains deferred.
- Broader design-token cleanup beyond touched nav/page-shell styles remains deferred.

## Manual testing checklist
- [ ] Visit `/` and confirm landing nav behavior is unchanged (anchor-based sections still work).
- [ ] Visit `/onboarding`, `/discovery`, `/conversations`, and `/profile` and confirm:
  - [ ] app shell renders consistently
  - [ ] route-level eyebrow/title/description render consistently
  - [ ] exactly one clear route-level `h1` appears per route
- [ ] On mobile width for each app route:
  - [ ] open menu and verify focus moves to first link
  - [ ] press Escape and verify menu closes + focus returns to toggle
  - [ ] activate a route link and verify menu closes and navigation occurs
- [ ] Verify active route indicator is visible but subtle in both desktop and mobile nav.
- [ ] Verify keyboard focus-visible states remain present for nav and interactive controls.

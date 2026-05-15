# Run 2 Notes — Route-Level App Structure

## Files changed
- `apps/web/src/components/navigation.js`
- `reviews/run-2-notes.md`

## Route structure created
The app now uses route-level structure for the main Lingr surfaces:
- `/` → public landing / product introduction
- `/onboarding` → onboarding flow experience
- `/discovery` → discovery experience
- `/conversations` → conversation experience
- `/profile` → profile experience

Implementation details already in codebase for this run:
- Route metadata and app nav mapping are defined in `apps/web/src/routes.js`.
- Route rendering and app-shell mounting are handled in `apps/web/src/main.js`.
- Shared authenticated-style shell (header/nav/footer + main container) is handled in `apps/web/src/components/app-shell.js`.

## Components moved or reused
- Reused existing route surface components without redesign:
  - `createOnboardingSection` for `/onboarding`
  - `createDiscoverySection` for `/discovery`
  - `createConversationsSection` for `/conversations`
  - `createProfileExperienceSection` for `/profile`
- Reused shared layout helpers:
  - `createAppShell` for route-level shell consistency
  - `createPageContainer` / `createPageSection` for common structure and headings
- Updated default landing navigation links so app-surface items now point to route paths instead of same-page anchors.

## Accessibility and navigation notes
- Preserved Run 1 mobile nav behavior (close on link select, Escape handling, focus return behavior).
- Route pages retain clear semantic page structure with page-level heading via shared `createPageSection` plus section-level structure from reused components.

## Issues deferred
- No auth guards/redirect enforcement yet (prototype note behavior remains in place).
- No backend/database integration (mock frontend data only).
- No visual redesign or feature expansion beyond route organization.

## Manual testing checklist
- [ ] Visit `/` and confirm landing stays public/product-focused.
- [ ] Visit `/onboarding` and confirm onboarding flow still works (back/continue/finish).
- [ ] Visit `/discovery` and confirm discovery cards, intro pacing, and CTA behavior render as before.
- [ ] Visit `/conversations` and confirm conversation list/detail switching still works.
- [ ] Visit `/profile` and confirm profile sections/layers render as before.
- [ ] On mobile viewport, open menu, activate each route link, and confirm menu closes correctly.
- [ ] On mobile viewport, open menu and press `Escape`; confirm menu closes and focus returns to toggle.
- [ ] Verify navigation highlighting in app-shell routes reflects active route.
- [ ] Verify there is no authentication/backend dependency required to render any route.

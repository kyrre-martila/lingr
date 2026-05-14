# Run 2 Notes — Route-level Structure

## Files changed
- `apps/web/src/main.js`
- `apps/web/src/components/navigation.js`
- `apps/web/src/components/hero.js`
- `apps/web/src/components/footer.js`
- `apps/web/src/styles/main.css`
- `reviews/run-2-notes.md`

## Route structure created
- `/` → public landing content (hero, philosophy, how it works, safety, CTA)
- `/onboarding` → onboarding flow surface
- `/discovery` → discovery surface
- `/conversations` → conversation surface
- `/profile` → profile surface

## Components moved or reused
- Reused existing section components without feature changes.
- Added route composition in `main.js` to assemble pages by route while keeping shared header/footer.
- Reused the same navigation component for all routes with active-link state.
- Added a small reusable route intro section generator in `main.js` for clear page headings/semantics.

## Issues deferred
- Direct deep-link support for non-root static hosting setups may require server rewrite rules.
- Existing mock relative time labels remain unchanged (out of scope for this run).
- Additional token normalization across all legacy styles remains deferred.

## Manual testing checklist
- [ ] Visit `/` and confirm only public/product intro sections are shown.
- [ ] Visit `/onboarding` and verify onboarding flow renders and step behavior remains unchanged.
- [ ] Visit `/discovery` and verify discovery cards and interactions still work.
- [ ] Visit `/conversations` and verify conversation list/detail switching still works.
- [ ] Visit `/profile` and verify profile sections and layered content render.
- [ ] On mobile width, open nav, activate each route link, and verify menu closes and focus returns to toggle.
- [ ] Verify active nav link updates per route.
- [ ] Verify keyboard navigation and polite status announcements in onboarding still behave as in Run 1 fixes.

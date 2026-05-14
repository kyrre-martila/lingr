# Review Run 1 Fixes

## Files changed
- `apps/web/src/components/navigation.js`
- `apps/web/src/components/onboarding/index.js`
- `apps/web/src/components/glimps/create-flow.js`
- `apps/web/src/components/step-flow.js`
- `apps/web/src/styles/main.css`
- `apps/web/src/components/hero.js`
- `reviews/review-run-1-fixes.md`

## Issues fixed
- Mobile nav now closes on link click and on `Escape`, moves focus into menu when opened, and returns focus to the toggle when closed.
- Onboarding and Glimps flows now share a reusable step-flow controller for rendering, validation handling, and step transitions.
- Form status messaging changed from assertive alerts to polite status notices to reduce unnecessary screen-reader interruption noise.
- Step transitions now shift focus to first interactive field in the next step for better keyboard and assistive flow.
- Added semantic design tokens for surfaces, borders, shadows, text-muted, and motion timing; applied in key form/card areas.
- Added reusable primitive classes: `panel`, `section-header`, `status-notice`, and `action-row`.
- Terminology adjusted in user-facing copy where touched (e.g., “Daily Glimps preview”).

## Issues intentionally deferred
- Full conversion of all hard-coded colors and shadows to semantic tokens (only high-repeat/high-impact areas updated).
- Full renaming of legacy `glimpse-*` class and data naming to `glimps-*` (risk of broad regressions in stabilization pass).
- Route-level decomposition and larger architecture restructuring were deferred (out of scope for this pass).

## Manual behavior to test
- Mobile navigation on small screens:
  - Open menu via keyboard and verify focus lands on first link.
  - Select a link and verify menu closes and focus returns to toggle.
  - Press `Escape` while menu is open and verify same close/focus behavior.
- Onboarding and Glimps flows:
  - Verify Back/Continue/Finish behaviors match pre-fix behavior.
  - Verify validation messages are announced politely and do not spam repeated announcements.
  - Verify focus moves to the next step’s first interactive control.

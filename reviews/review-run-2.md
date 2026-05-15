# Run 2 Review — Lingr

## 1) Summary
Run 2 is a meaningful architecture improvement over Run 1: routing concerns are now explicit, app-page composition is separated from bootstrapping, route metadata is centralized, and session/route-access helpers create a clean seam for future auth integration. The overall direction is good and aligns with maintainability goals.

The biggest remaining risks are **state/data coupling and consistency drift**: some route-level access behavior still has prototype shortcuts, feature state remains centralized in a single state module, some components still instantiate mock data at render-time, and naming/folder conventions are only partially stabilized.

Overall: **good structural progress**, but the next pass should harden contracts (route metadata, access policy, state ownership, data lifecycle) so future backend/auth/mobile integration does not require broad rewrites.

---

## 2) What is working well

- **Route-level architecture is now modularized**:
  - `main.js` is focused on app bootstrapping + render orchestration.
  - Route-page composition moved into `app/route-page.js`.
  - Route-to-builder mapping moved into `app/page-builders.js`.
  This is a strong separation of concerns for future router evolution.

- **Centralized route metadata and access helpers are a good foundation**:
  - `routes.js` defines path/intent/access/nav visibility in one place.
  - `state/route-access.js` centralizes “can access?”, expected future session states, and nav filtering.
  This reduces logic scatter and is auth-ready in concept.

- **App shell direction is healthy**:
  - `components/app-shell.js` cleanly owns app header/main/footer assembly and delegates page content via `pageBuilder`.
  - Nav visibility is derived from route access + session state rather than hard-coded per page.

- **Navigation behavior improvements from prior pass remain intact**:
  - Mobile menu close-on-link and Escape behavior are present.
  - Route navigation interception is scoped to route-like hrefs only.

- **Mock data is moving toward domain folders**:
  - Canonical mock data sits under `data/mocks/*`, and conversations now consume from that location.

---

## 3) Main issues found

1. **Access policy is logically inconsistent for future guard modeling**
   - `SESSION_STATES.ONBOARDING` currently has access to `ROUTE_ACCESS.APP` routes in `SESSION_ACCESS_MAP`, while those app routes are framed as future-gated app intent.
   - This is acceptable for prototype permissiveness, but it blurs future guard semantics and can mislead contributors about intended auth boundaries.

2. **Route fallback behavior masks unknown paths as landing page**
   - Unknown route paths render landing content (`main.js` fallback) instead of explicit 404 or route-not-found UI.
   - For future mobile/web parity and API-backed deep links, silent fallback can hide routing bugs.

3. **State module remains “global bucket” style**
   - `state/index.js` exports feature states across onboarding, glimps, discovery, conversation, UI preferences, and session in one place.
   - This creates a soft monolith and can cause import sprawl as features grow.

4. **Render-time mock data creation is still mixed and not fully deterministic by state**
   - Example: `discovery.js` has module-level `createDiscoveryMockData()` and also reads `discoveryState` for limits.
   - Example: `conversations/index.js` creates mock conversations inside the section builder each render.
   This split between data factories and stores weakens future backend adapter design.

5. **Naming consistency still has residue**
   - `glimpsState` naming is still non-standard compared with pluralized domain usage (`glimps`, `discovery`, `conversations`), and class/copy naming around Glimps remains mixed across codebase.

---

## 4) Architecture concerns

- **Route metadata is good but under-typed/under-validated**
  - Route `intent` is string-based and unconstrained; access and intent could drift silently.
  - Consider a stricter route contract (even in JS) via constants or validation helper for route definitions.

- **Guard hint responsibility may belong closer to routing boundary**
  - `createRoutePage()` prepends a “prototype note” based on `getRouteSessionGuardHint`.
  - This couples product-page rendering with routing-policy messaging. In future auth rollout, guard-hint and redirect logic should be owned by router/app-shell boundary, not page content wrappers.

- **App shell rebuild strategy may limit scalability**
  - Current navigation pushes history then dispatches `popstate`, and whole app re-renders.
  - Works now, but future performance/state retention (e.g., preserving scroll, form draft, list positions) will need route-level lifecycle boundaries.

- **Domain boundaries are improving but not complete**
  - `app/`, `state/`, `data/mocks/`, `components/` are good top-level lanes.
  - But feature components still encapsulate a lot of view/data wiring internally, making shared route-domain ownership less explicit.

---

## 5) Accessibility concerns

- **Listbox semantics need keyboard parity**
  - Conversation list uses `role="listbox"`/`role="option"` but navigation behavior is click-only; no arrow-key selection model implemented.
  - Either implement full listbox keyboard interactions or simplify semantics to standard list + buttons.

- **Progressbar semantics likely remain misleading**
  - Discovery intro track presents visual segments of used/open intros with `role="progressbar"`; assistive interpretation may not match conceptual model (“used today” vs “remaining opportunities”).

- **Guard hint notice is plain paragraph without explicit live or landmark strategy**
  - If route state/session changes in future, ensure status updates are announced appropriately without interruption overload.

- **Message bubbles are tabbable articles**
  - `tabIndex=0` on every message bubble increases tab stops and can hurt keyboard efficiency on mobile keyboards/screen readers.

---

## 6) State/data concerns

- **State ownership is not yet domain-isolated**
  - `state/index.js` mixes feature and UI preference stores with session export.
  - Recommend moving toward `state/<domain>.js` public contracts and an optional aggregator index for imports.

- **Data freshness and temporal realism still depend on static labels**
  - Mock data includes relative-time style labels and fixed dates/times in places; this will feel stale and complicate transition to real API payloads.

- **Feature state vs source data boundaries are blurry**
  - Conversations maintain active ID in store but message arrays are local data factory output.
  - Discovery has session limit values in store but card payload fixed in mock factory.
  This hybrid is okay for prototype, but should become explicit “server snapshot + local UI state” layering.

---

## 7) Auth-readiness concerns

- **Good seam exists, but enforcement strategy is still implicit**
  - `canSessionAccessRoute` and `getRouteAccessSummary` are strong integration points.
  - Missing next step: explicit guard mode switch (prototype-open vs enforce) at router boundary.

- **Session model is too coarse for real auth onboarding transitions**
  - Real systems typically need distinct signals: auth status, onboarding completion, profile completeness %, verification state, and feature flags.
  - Current `SESSION_STATES` are useful placeholders but should evolve into structured session claims to avoid enum explosion.

- **No redirect policy mapping yet**
  - Future route enforcement should define deterministic redirect targets (`/onboarding`, `/discovery`, etc.) per guard failure reason.

---

## 8) Mobile-app-readiness concerns

- **Route and access metadata are portable in concept**
  - Central metadata + access helpers could be shared as platform-agnostic policy logic.

- **But current UI architecture is still web-DOM centric**
  - Feature modules combine content, interaction, and DOM construction directly.
  - For future mobile parity, extract domain/view-model logic from DOM builders so React Native (or another client) can reuse data/state policies.

- **Navigation abstraction is not yet platform-neutral**
  - History + `popstate` dispatch is web-specific.
  - Future-ready step is to define a minimal navigation interface (push, replace, currentRoute, subscribe).

---

## 9) Suggested refactor plan

1. **Lock route contract and guard policy (high priority)**
   - Add route schema validator/helper in `routes.js`.
   - Introduce explicit app-level “guard mode”: `prototype_open` vs `enforced`.
   - Centralize redirect decision function in `state/route-access.js` (or a new `app/route-guards.js`).

2. **Split state by domain and define ownership boundaries**
   - Separate files for `state/discovery.js`, `state/conversations.js`, `state/onboarding.js`, `state/ui-preferences.js`, while keeping a lightweight export index.
   - Keep session/auth state isolated from feature UI state.

3. **Normalize mock-data lifecycle**
   - Move to one pattern: create initial snapshot once (boot or per route load), then mutate only stores/UI state.
   - Avoid mixing module-level static mock payload and per-render factories in feature components.

4. **Accessibility hardening pass**
   - Fix conversation list semantics/keyboard behavior.
   - Revisit discovery progress semantics.
   - Reduce unnecessary tab stops in message streams.

5. **Naming and folder consistency pass**
   - Canonicalize “Glimps” naming across state keys, data structures, and class/id naming where safe.
   - Document folder responsibility boundaries (`app`, `components`, `state`, `data/mocks`).

---

## 10) Prioritized next steps

### P0 (next prompt)
- Define and implement explicit route guard operating modes + redirect mapping without changing product behavior by default.
- Tighten accessibility semantics for conversation list and discovery pacing indicator.

### P1
- Split `state/index.js` into domain modules and keep backward-compatible exports.
- Standardize mock data initialization pattern for discovery + conversations.

### P2
- Normalize naming inconsistencies (especially `glimpsState` and related domain naming).
- Add lightweight architecture doc for contributor consistency.

### P3
- Begin extraction of view-model/domain logic from large DOM-centric components to improve backend and mobile portability.

---

## Concrete files reviewed
- `apps/web/src/main.js`
- `apps/web/src/routes.js`
- `apps/web/src/app/route-page.js`
- `apps/web/src/app/page-builders.js`
- `apps/web/src/components/app-shell.js`
- `apps/web/src/components/navigation.js`
- `apps/web/src/components/discovery.js`
- `apps/web/src/components/conversations/index.js`
- `apps/web/src/state/index.js`
- `apps/web/src/state/session.js`
- `apps/web/src/state/route-access.js`
- `apps/web/src/data/mocks/conversations.js`
- `reviews/review-run-1.md`
- `reviews/review-run-1-fixes.md`
- `reviews/run-2-notes.md`

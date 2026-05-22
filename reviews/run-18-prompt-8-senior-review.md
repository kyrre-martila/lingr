# Run 18 Prompt 8 — Senior Review: Next.js Private Beta Baseline

Date: 2026-05-22 (UTC)
Reviewer: Principal Frontend Engineer (Codex)

## Scope Reviewed
- `apps/web` App Router and UI foundation
- `apps/api` route contracts relevant to web usage
- `packages/shared` contract/constants alignment
- design and deploy notes (`docs/design_mockup/*`, `docs/deploy-proxmox.md`)

## Inputs and constraints check
- `ai-guide.md`: **not found in repo root** at review time.
- `DEVELOPMENT_PLAN.md`, `README.md`: reviewed.
- `apps/web`: reviewed route structure, shell/components, API client, styles.
- `apps/api` route contracts: reviewed `src/routes/index.js` and endpoint surface.
- `packages/shared`: reviewed contract constants/envelopes.
- `docs/design_mockup/*`: reviewed baseline design intent doc and assets presence.
- deployment notes: reviewed Proxmox/Cloudflare tunnel notes.

## Audit Findings

### 1) App Router structure
**Status: pass (with one maturity gap).**
- App Router pages are present for current MVP surfaces (`/`, `/login`, `/onboarding`, `/discovery`, `/sparks`, `/conversations`, `/settings`).
- Root layout + shell are in place and route map is coherent for private beta testing.
- Maturity gap: no App Router-native `loading.js`/`error.js` boundaries yet; not a blocker for deploy smoke, but desirable before broader beta.

### 2) Client/server component usage
**Status: pass.**
- Server layout composition is minimal and clean.
- Interactive behavior is isolated in client components where needed.
- No obvious server component misuse observed in reviewed routes.

### 3) Hydration risk
**Status: acceptable for deploy testing.**
- No obvious SSR/client mismatch pattern in active App Router path.
- Legacy DOM-builder code exists in `apps/web/src/legacy/*` and separate legacy component tree, but appears outside active Next.js app runtime path.

### 4) Remaining LegacyMount / DOM-builder code
**Status: warning (non-blocking).**
- Significant legacy DOM-builder code remains under `apps/web/src/*` and `apps/web/index.html`.
- This is a maintainability/professionalism risk because engineers can accidentally extend stale path.
- Not an immediate deploy blocker if teams treat App Router as the only active runtime.

### 5) API client/env handling
**Status: pass (deploy-usable).**
- API base URL resolution supports `NEXT_PUBLIC_API_BASE_URL` with sane local fallback.
- Credentials include mode aligns with cookie-session transport.
- Envelope/error normalization is consistent with shared contracts.

### 6) Route completeness
**Status: pass for baseline private-beta testing.**
- Web route surface maps to core API route families required for auth/onboarding/discovery/sparks/conversations/settings-style flow.
- Missing deep product features are intentionally out of scope per prompt.

### 7) Styling maintainability
**Status: acceptable with technical debt.**
- Central app-level stylesheet exists and is coherent enough for deploy smoke.
- Legacy styling and dual architecture increase cognitive overhead.

### 8) Mobile layout quality
**Status: acceptable baseline.**
- Current shell/layout appears viable for private-beta manual testing.
- No obvious catastrophic mobile blockers found from code structure review.

### 9) Accessibility basics
**Status: partial pass.**
- Basic semantic structures and labels are present in core surfaces.
- Not yet at robust a11y maturity (route-level error/loading focus management and more systematic landmark consistency still desirable).

### 10) Workspace imports
**Status: pass.**
- `@lingr/shared` contract usage in web client is correct and supports cross-workspace consistency.

### 11) Package scripts
**Status: pass.**
- `@lingr/web` scripts (`dev`, `build`, `start`, `lint`) are adequate for Proxmox PM2 usage.

### 12) Proxmox deploy readiness
**Status: pass.**
- Deployment doc aligns with Next.js runtime (`next build` + `next start`) and PM2 usage.
- Operational sequence is clear enough for pull-and-restart testing.

### 13) Cloudflare tunnel readiness
**Status: pass.**
- Hostname mapping and local target assumptions documented and aligned with web/API ports.

### 14) Alignment with Lingr philosophy
**Status: pass.**
- Foundation direction remains calm/low-pressure and avoids urgency-style primitives in reviewed surfaces.

## Fixes Made
No application feature changes were required.

I made one deliverable change only:
- Added this formal senior review artifact under `reviews/` for team tracking and deploy decisioning.

## Remaining Risks (important)
1. **Dual-architecture confusion risk**: legacy DOM code is still present and sizable; future contributors may accidentally build into stale path.
2. **A11y maturity risk**: private beta acceptable, but route-level loading/error/accessibility patterns are not yet fully standardized.
3. **Operational config risk**: deploy relies on correct production env (`NEXT_PUBLIC_API_BASE_URL`) and healthy API/session cookie domain behavior in real tunnel/proxy path.

## Deploy Decision
### Question
Is `apps/web` ready to pull onto Proxmox and test through `lingr.martila.no`?

### Answer
**Yes — for private-beta deploy testing, with caution.**

Rationale:
- Build and smoke workflow targets are satisfiable.
- App Router baseline is coherent and deployable.
- Current gaps are mostly maintainability/maturity concerns, not immediate blockers for controlled testing.

## Foundation Score (0–100)
**84 / 100**

Scoring rationale:
- + Strong deploy/build baseline and route/API alignment.
- + Philosophy alignment retained.
- - Legacy dual-stack debt still visible.
- - Accessibility and route-level resilience patterns need further hardening before wider beta.

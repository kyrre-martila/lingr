# Run 18.5 Prompt 3 — Principal Engineer Final Review Before Proxmox Deploy

Date: 2026-05-22 (UTC)
Reviewer: Principal Engineer (Codex)

## Scope
Reviewed and validated before first Proxmox pull test:
- `DEVELOPMENT_PLAN.md`
- `README.md`
- `docs/deploy-proxmox.md`
- `reviews/run-18*`
- `apps/web`
- `apps/api`
- `packages/shared`
- `docs/design_mockup/*`

## Principal Review Summary

### 1) Next.js App Router correctness
- App Router root is correctly structured with `app/layout.js` wrapping route content in `AppShell`.
- Route pages for private beta core paths are present and compile under Next.js 15 build output.
- Global boundaries exist (`app/loading.js`, `app/error.js`, `app/not-found.js`) and are calm-tone aligned.
- Client/server separation is coherent (`app/error.js` is client as required; static route files remain server-safe by default).
- No obvious hydration mismatch patterns found in active App Router route tree.

### 2) Frontend architecture
- API client is centralized (`apps/web/lib/api-client.js`) and uses shared contract constants from `@lingr/shared/contracts`.
- Route organization in `app/*` and `components/*` is maintainable for current scope.
- Legacy code remains isolated under `apps/web/src/legacy/*`; this is a maintainability warning, not a deploy blocker.

### 3) Deployment readiness
- Next.js production build succeeds.
- Next.js production start succeeds and serves on port `3000`.
- Response includes `X-Powered-By: Next.js`, confirming runtime output is served via Next, not legacy static hosting.
- Proxmox docs correctly use PM2 + workspace `start`; no static `serve apps/web` assumption.
- `NEXT_PUBLIC_API_BASE_URL` handling is present in web API client with sane local fallback.

### 4) API compatibility
- Frontend API paths in `apps/web/lib/api-client.js` map to implemented API routes in `apps/api/src/routes/index.js`.
- Cookie/session approach is aligned (`credentials: include`; API sets/clears HttpOnly session cookie).
- No active localStorage bearer-token auth path in web API transport.

### 5) Safety and philosophy conformance
- No online status/read receipts/typing indicators/timestamps are introduced in reviewed App Router surfaces.
- Error/loading/not-found language remains calm and non-urgent.

### 6) Mobile/private beta readiness
- Layout baseline is mobile-safe for private beta smoke-level testing.
- Core loading and error states exist and are coherent.
- No obvious “feels broken” blocker found in reviewed deployment-critical paths.

## Blockers Found
- **No hard blockers** for first Proxmox pull-and-test found in this run.

## Low-risk Observations (Non-blocking)
1. Build logs include a CSS autoprefixer warning (`start` value mixed support) from `apps/web/src/styles/main.css`.
2. Legacy architecture remains in repo and can cause contributor confusion if guardrails are not maintained.
3. `npm install` reported existing vulnerabilities; these are dependency hygiene concerns not validated as immediate runtime blockers in this deploy gate.

## Validation Executed
- `npm install`
- `npm run build --workspace @lingr/web`
- `npm run e2e:smoke --workspace @lingr/api`
- `npm run start --workspace @lingr/web` (runtime check via `curl -I http://localhost:3000`)

## Deploy Decision
**Recommendation: proceed with controlled Proxmox deployment test now.**

Confidence for first deploy test: **92 / 100**.

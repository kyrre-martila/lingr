# Run 11.7 — Prompt 4 E2E smoke test (Codex cloud)

## Environment used
- Repo: `/workspace/lingr`
- Date: 2026-05-20 (UTC)
- Node: `v20.20.2`
- npm: `11.4.2`
- Postgres: installed in-session via `apt` (`postgresql-16`), cluster `16/main`, local port `5432`
- API target: `http://localhost:4000`
- `DATABASE_URL=postgresql://lingr:lingr@localhost:5432/lingr?schema=public`

## Commands run (chronological)
1. `pwd; rg --files -g 'AGENTS.md'`
2. `rg --files | head -n 200`
3. `find . -maxdepth 3 -name AGENTS.md -o -name package.json`
4. `cat package.json; cat apps/api/package.json`
5. `cat README.md; rg -n "DATABASE|POSTGRES|PORT|SESSION|COOKIE|dev-e2e|seed" apps/api -S`
6. `rg -n "router|app\.|/v1/|spark|conversation|message|onboarding|profile|discover|match-cards|guess|snuggle|logout|login|register" apps/api/src -S`
7. `node -v; npm -v; psql --version || true; pg_isready || true; printenv | rg -n "DATABASE_URL|POSTGRES|PG"`
8. `docker --version || true; podman --version || true`
9. `cat apps/api/prisma/schema.prisma`
10. `sudo apt-get update && sudo apt-get install -y postgresql`
11. `sudo pg_ctlcluster 16 main start && pg_isready`
12. `sudo -u postgres psql -c "CREATE USER lingr WITH PASSWORD 'lingr';" || true`
13. `sudo -u postgres psql -c "CREATE DATABASE lingr OWNER lingr;" || true`
14. `sudo -u postgres psql -c "ALTER ROLE lingr CREATEDB;"`
15. `npm install`
16. `npm run db:generate --workspace @lingr/api`
17. `npm run db:migrate --workspace @lingr/api -- --name smoke` (failed: non-interactive)
18. `npm run db:migrate:deploy --workspace @lingr/api`
19. `npm run db:seed:dev-e2e --workspace @lingr/api`
20. `npm run start:api` (kept running)
21. Multiple `curl` + `jq` API smoke sequences for register/login/profile/discovery/sparks/conversations/messages/chat-apps/logout-login persistence.
22. Direct Prisma one-off update attempts via `node -e` (for test-only lifecycle bypass), failed due to DB/schema mismatch.

## What passed
- Dependencies already installed/up-to-date.
- Prisma client generation succeeded after schema blocker fix.
- Existing migrations were applied to local Postgres.
- Dev E2E region seed succeeded (`NO`, `trondelag`, open).
- API booted and served on port `4000`.
- Auth register/login/logout endpoints reachable.
- Core routes are reachable and return structured error envelopes when blocked.

## What failed
1. **Initial Prisma generate failed** before smoke due to schema relation validation:
   - Missing opposite relations on `Conversation` for:
     - `MatchCardsSession.conversation`
     - `GuessMeSession.conversation`
     - `SnuggleSession.conversation`
2. `prisma migrate dev` failed in this non-interactive Codex environment (expected tooling limitation for `migrate dev`).
3. Full discovery flow blocked by lifecycle gating:
   - `GET /v1/discovery/daily` returned `discovery.onboarding_required` after profile patch + relogin attempts.
4. Test-only direct DB lifecycle override attempt failed because DB schema appears behind Prisma model in this environment:
   - Prisma update error: column `profiles.pronouns` does not exist.

## Blockers fixed
- **Fixed required Prisma schema relation blocker** in `apps/api/prisma/schema.prisma` by adding missing back-relations on `Conversation`:
  - `matchCardsSessions MatchCardsSession[]`
  - `guessMeSessions GuessMeSession[]`
  - `snuggleSessions SnuggleSession[]`

## Remaining blockers (not fixed in this run)
- Migration history vs current Prisma schema drift (e.g. `profiles.pronouns` missing in DB after applying repo migrations) prevents clean direct DB overrides and indicates migration/model mismatch requiring a proper migration fix.
- Onboarding/lifecycle gating blocks discovery path for E2E without a stable test-only lifecycle override path that matches actual DB schema.

## Remaining manual UI checks
- Web app startup and browser checks were not completed in this run because backend smoke was blocked at lifecycle/schema layer before full conversation/chat-app progression.
- Once DB/schema drift is resolved, manually verify in UI:
  - registration + login
  - onboarding completion transitions user lifecycle to active
  - discovery card exposure
  - Spark mutual flow
  - conversation creation and bidirectional messages
  - Match Cards / Guess Me / Snuggle interaction states
  - layer unlock messaging at allowed thresholds
  - logout/login persistence in browser cookie session

## Is local/browser testing still required?
- **Yes.** Browser/manual local testing is still required after DB schema drift + lifecycle gating are fixed.

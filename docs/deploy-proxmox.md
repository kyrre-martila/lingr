# Proxmox deploy (Next.js web + API via PM2)

## Runtime assumptions
- PostgreSQL runs in Docker.
- API runs in PM2 on port `4000`.
- Web (Next.js) runs in PM2 on port `3000`.
- Cloudflare Tunnel maps:
  - `lingr.martila.no -> http://localhost:3000`
  - `api.lingr.martila.no -> http://localhost:4000`

## Why this command
The web app is a Next.js app and must be started with `next start` (the workspace `start` script), so PM2 serves the `.next` production build output. Do **not** run `serve` against old static files in `apps/web`.

## PM2 command (web)
```bash
pm2 start npm --name lingr-web --workspace @lingr/web -- start
```

Equivalent fallback form:
```bash
pm2 start npm --name lingr-web -- run start --workspace @lingr/web
```

## Deploy steps
```bash
git pull
npm install
npm run build --workspace @lingr/web
npm run db:migrate:deploy --workspace @lingr/api   # only when API/DB changes
pm2 restart lingr-api                               # only when API changes
pm2 restart lingr-web || pm2 start npm --name lingr-web --workspace @lingr/web -- start
pm2 save
```

Set/verify production web env before restart:
```bash
# apps/web/.env.production
NEXT_PUBLIC_API_BASE_URL=https://api.lingr.martila.no
```

## Verification
```bash
pm2 status
curl -i http://localhost:3000
curl -i http://localhost:4000/v1/health
```

Expected web response should include Next.js headers/content (for example `X-Powered-By: Next.js`) and `/_next/static/...` assets, confirming `.next` build output is being served.

## Rollback
If deploy fails, rollback quickly:
```bash
# 1) go back to previous known-good commit
git log --oneline -n 5
git checkout <previous-good-commit>

# 2) reinstall and rebuild web production output
npm install
npm run build --workspace @lingr/web

# 3) restart process manager targets
pm2 restart lingr-api
pm2 restart lingr-web
pm2 save

# 4) verify
pm2 status
curl -i http://localhost:3000
curl -i http://localhost:4000/v1/health
```

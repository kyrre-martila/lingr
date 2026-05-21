# Proxmox VM deploy (web + api)

## Current runtime assumptions
- API runs on PM2 at port `4000`
- Web runs on PM2 at port `3000`
- Postgres runs in Docker
- Cloudflare Tunnel mappings:
  - `lingr.martila.no -> http://localhost:3000`
  - `api.lingr.martila.no -> http://localhost:4000`

## Update commands
```bash
git pull
npm install
npm run build --workspace @lingr/web
```

Update `apps/web/.env.production`:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.lingr.martila.no
```

Start or restart web on PM2:
```bash
pm2 start npm --name lingr-web -- run start --workspace @lingr/web -- -p 3000
# or if it already exists
pm2 restart lingr-web
pm2 save
```

Verify:
```bash
curl -i http://localhost:3000
curl -i http://localhost:4000/v1/health
pm2 status
```

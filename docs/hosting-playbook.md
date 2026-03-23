# Self-Hosted Apps Playbook (PWs)

This is the global deployment standard for apps inside `PWs`.
Use it for local Windows testing and Linux server production.

## 1) Goal

For each app:
- dockerize once,
- boot with one command,
- support partial redeploys (front/back/gateway/tunnel),
- publish with Cloudflare Tunnel when needed,
- keep active app config documented to avoid port collisions.

## 2) Mandatory script contract per app

Every publishable app folder must expose this interface:

- `./init-app` (bash)
- `./init-app.ps1` (PowerShell)
- `./scripts/deploy-part.sh`
- `./scripts/deploy-part.ps1`
- `./scripts/init-and-deploy.sh`
- `./scripts/init-and-deploy.ps1`

If app is public via Cloudflare:
- `./scripts/start-cloudflare-tunnel.sh`
- `./scripts/start-cloudflare-tunnel.ps1`
- `./scripts/refresh-cloudflare-tunnel.sh`
- `./scripts/refresh-cloudflare-tunnel.ps1`

## 3) What each script must do

### `init-app` / `init-app.ps1`
- create `.env` if missing (from `.env.example` + generated secrets where possible),
- run full stack build/start: `docker compose up -d --build`,
- validate local readiness (HTTP health check),
- print local URLs.

### `deploy-part.*`
- receive target: `frontend|backend|gateway|cloudflared|all`,
- deploy only requested service,
- preserve DB and unaffected services.

### `init-and-deploy.*`
- run `init-app`,
- then run tunnel start script,
- print public URL when `CLOUDFLARE_PUBLIC_HOSTNAME` exists in `.env`.

## 4) Docker/compose baseline for new app

Recommended:
- one compose file per app: `<app>/docker-compose.yml`,
- one gateway reverse proxy service for that app when needed,
- do not expose DB port to host unless strictly required,
- set `restart: unless-stopped` for long-running services,
- keep secrets in `.env` only (never hardcode).

## 5) Cloudflare model used here

- Preferred for production: named tunnel + token (`CLOUDFLARED_TUNNEL_TOKEN`).
- Quick tunnel (`trycloudflare.com`) only for temporary demo/testing.
- One tunnel can route multiple apps by hostnames.
- Keep a unique hostname per app (example: `trips.devogs.com`).

## 6) Deploy workflows

### First boot in an app folder

Linux:
```bash
bash ./init-app
```

Windows:
```powershell
.\init-app.ps1
```

### Full boot + publish

Linux:
```bash
bash ./scripts/init-and-deploy.sh
```

Windows:
```powershell
.\scripts\init-and-deploy.ps1
```

### Partial redeploy after pull

Linux:
```bash
git pull
bash ./scripts/deploy-part.sh frontend
```

Windows:
```powershell
git pull
.\scripts\deploy-part.ps1 -Target frontend
```

Use `backend`, `gateway`, `cloudflared`, or `all` as needed.

## 7) CI/CD (self-hosted)

Repo has workflow:
- `.github/workflows/deploy-selfhosted.yml`

Rule:
- changed paths decide which app/service is redeployed.

When adding a new app:
1. add its path filters,
2. add job steps that call that app `deploy-part` targets,
3. keep deploy logic partial by default (avoid full stack if only front changed).

## 8) Linux server operational notes

- Prefer headless Linux target for lower RAM usage.
- Keep Docker engine always enabled.
- Use SSH key auth only.
- Use dedicated deploy user in `docker` group.
- Run app updates as: pull -> partial deploy -> status check.

## 9) Required documentation update policy

This is mandatory:

Whenever a new app gets `init-app` (or equivalent bootstrap script), you must update:
- `docs/apps-active-registry.md`

At minimum add:
- app name and path,
- host ports,
- domain/hostname routes,
- tunnel mode (named/quick/no tunnel),
- deploy scripts and supported targets,
- current status (`active`, `inactive`, `planned`).

No app is considered production-ready in this repo without that registry entry.


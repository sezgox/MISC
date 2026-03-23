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

### Repo scope rule (required for CI publish)

- App folder must be inside this repo tree (`PWs/<AppName>/`).
- Root workflow `.github/workflows/deploy-selfhosted.yml` is path-based, so folders outside `PWs` are invisible to automatic deploy.
- If an app currently lives outside this repo (example: `../Gael-Games`), onboard it first by moving it into `PWs`, adding it as a submodule, or mirroring it into an in-repo folder used by deploy.

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

### Static frontend apps (Vite/Phaser/etc.)

Use the same script contract even when there is no backend/database.

- Keep `deploy-part` targets compatible with global contract:
  - `frontend`: rebuild/restart static frontend service only.
  - `gateway`: rebuild/restart reverse proxy only.
  - `cloudflared`: restart connector only (if used).
  - `all`: full app stack for that folder.
  - `backend`: accepted target but should exit cleanly with "not applicable" when app has no backend service.
- `init-app` health check for static apps should validate:
  - app URL responds with HTTP 200,
  - SPA fallback works (`/<any-route>` serves app shell via gateway rewrite),
  - printed local URL is the gateway URL users will open.

## 4) Docker/compose baseline for new app

Recommended:
- one compose file per app: `<app>/docker-compose.yml`,
- one gateway reverse proxy service for that app when needed,
- do not expose DB port to host unless strictly required,
- set `restart: unless-stopped` for long-running services,
- keep secrets in `.env` only (never hardcode).

### Variables and secrets isolation (mandatory)

Do not share one global secret set across apps.

Required rules:
- each app has its own `.env` file inside its app folder,
- each app generates its own secrets (JWT/database/session/encryption),
- never reuse one `JWT_SECRET` value across different apps,
- CI runner must inject secrets per app scope (not one global env blob for all apps),
- keep secret names explicit when there is any chance of shared execution context.

Recommended naming in shared contexts (CI/scripts/global env):
- `VIAJECHAVALES_JWT_SECRET`
- `PORTFOLIO_JWT_SECRET`
- `GAELGAMES_JWT_SECRET`

Then map to app-local env names during deploy if needed.

Why:
- avoids token cross-validation between apps,
- limits blast radius if one app secret leaks,
- prevents accidental overrides when multiple deploy jobs run on same host/runner.

### Shared Cloudflare tunnel token (local private doc)

For this repo, the commonly used Cloudflare tunnel token is stored in:
- `docs/private/cloudflare-shared-token.local.md`

Rules:
- keep this file local only (never tracked/pushed),
- copy `CLOUDFLARED_TUNNEL_TOKEN` from that local doc into each app `.env` as needed,
- keep `CLOUDFLARE_PUBLIC_HOSTNAME` unique per app route.

## 5) Cloudflare model used here

- Preferred for production: named tunnel + token (`CLOUDFLARED_TUNNEL_TOKEN`).
- Quick tunnel (`trycloudflare.com`) only for temporary demo/testing.
- One tunnel can route multiple apps by hostnames.
- Keep a unique hostname per app (example: `trips.devogs.com`).
- On one host, run a single `cloudflared` connector process for that named tunnel.
- Recommended owner in this repo: `ViajeChavales/cloudflared` as shared connector.
- Other apps should publish through host-level routing and must not keep a second always-on connector for the same tunnel.

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
3. keep deploy logic partial by default (avoid full stack if only front changed),
4. ensure the app path is inside `PWs/` so path filters can match it,
5. keep per-app `.env` file available on runner workspace.

## 8) Linux server operational notes

- Prefer headless Linux target for lower RAM usage.
- Keep Docker engine always enabled.
- Use SSH key auth only.
- Use dedicated deploy user in `docker` group.
- Run app updates as: pull -> partial deploy -> status check.

## 9) Logs and retention (mandatory for published apps)

### What is logged by default

- `gateway` (nginx): HTTP access logs (routes, status, referer, user-agent, forwarded IP).
- `backend`: app/runtime logs, warnings/errors, socket events if printed by app.
- `db`: postgres internal logs.
- `cloudflared`: tunnel connector health/reconnect logs.

By default Docker uses `json-file` driver, logs are separated per container.
Risk is disk growth over time (not RAM growth).

### How to read logs (per app and per service)

From app folder:

Linux/macOS:
```bash
docker compose --env-file .env logs -f gateway
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs -f cloudflared
docker compose --env-file .env logs --tail 200
```

Windows PowerShell:
```powershell
docker compose --env-file .env logs -f gateway
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs -f cloudflared
docker compose --env-file .env logs --tail 200
```

Raw Docker log path for a container:
```bash
docker inspect <container_name> --format "{{.LogPath}}"
```

### Recommended retention settings

For laptop self-hosting:
- `max-size: "10m"`
- `max-file: "3"`

For VPS always-on hosting:
- `max-size: "25m"`
- `max-file: "5"`

Apply per service in `docker-compose.yml`:

```yaml
services:
  gateway:
    logging:
      driver: json-file
      options:
        max-size: "25m"
        max-file: "5"
```

Use same logging block for `backend`, `db`, and `cloudflared`.

### Operational checks

Check largest container logs:
```bash
docker ps --format "table {{.Names}}\t{{.Image}}"
docker inspect <container_name> --format "{{.LogPath}}"
```

If needed, rotate by recreating target service:
```bash
docker compose --env-file .env up -d --force-recreate <service>
```

## 10) Required documentation update policy

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

## 11) New app onboarding checklist (publish gate)

Before saying "this app can publish with the rest", all items below must be true:

1. App is under `PWs/<AppName>/` (or equivalent in-repo path used by workflow filters).
2. Mandatory script contract exists (`init-app*`, `deploy-part*`, `init-and-deploy*`, and tunnel scripts if public).
3. App has `docker-compose.yml` with partial service redeploy support.
4. `.github/workflows/deploy-selfhosted.yml` includes path filters and deploy steps for that app.
5. `docs/apps-active-registry.md` row exists with ports/routes/tunnel mode/status.
6. Dry run passes on target host:
   - `./init-app(.ps1)`
   - `./scripts/deploy-part.* frontend`
   - optional `./scripts/deploy-part.* cloudflared`

## 12) Multi-agent worktree policy (mandatory)

For any app in `PWs` where multiple agents contribute in parallel:

1. Work using git worktrees (one worktree per agent).
2. Do not let multiple agents edit from the same worktree.
3. Wait until all participating agents finish their assigned scope before merging.
4. Run one integration review pass before final merge:
   - verify each change against global task context and per-agent scope,
   - accept/reject per contribution,
   - merge only the approved set.

Recommended:
- appoint one global reviewer/integrator agent to make the final acceptance decision.

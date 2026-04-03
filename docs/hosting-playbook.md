# Self-Hosted Apps Playbook (PWs)

This is the global deployment standard for apps inside `PWs`.
Use it for local Windows testing and Linux server production.

## 1) Goal

For each app:
- dockerize once,
- boot with one command,
- support partial redeploys (compose services; tunnel is separate at repo root),
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

If app is public via Cloudflare, the **named tunnel** is started only from repo root (not duplicated per app):
- `PWs/scripts/deploy-cloudflare-tunnel.sh`
- `PWs/scripts/deploy-cloudflare-tunnel.ps1`

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
- deploy only services defined in that app’s `docker-compose.yml` (partial rebuild/restart),
- preserve DB and unaffected services,
- targets depend on the app:
  - **ViajeChavales**: `frontend|backend|gateway|all` (`gateway` = Trips-only Nginx, alias `trips-gateway`; not the public ingress)
  - **static sites** (Portfolio, Gael-Games): `frontend|gateway|all` (`frontend` = static image build, `gateway` = nginx)
- **Shared ingress** (landing + vhosts): no `deploy-part` in app folders; use [`infra/ingress/up.sh`](../infra/ingress/up.sh) or CI job `deploy-ingress`.

### `init-and-deploy.*`
- run `init-app`,
- then run repo-root `scripts/deploy-cloudflare-tunnel.*` when the app is meant to be public,
- print public URL when `CLOUDFLARE_PUBLIC_HOSTNAME` exists in `.env`.

Operational contract (important):
- `deploy-part all` is the default day-to-day full redeploy target for one app.
- `init-and-deploy.*` is kept for bootstrap/first setup and publish flows.
- Keep both commands for compatibility, but prefer `deploy-part all` for routine updates.

### Static frontend apps (Vite/Phaser/etc.)

Use the same script contract even when there is no backend/database.

- Keep `deploy-part` minimal and aligned with compose services:
  - `frontend`: rebuild/restart static frontend service only.
  - `gateway`: rebuild/restart reverse proxy only.
  - `all`: full app stack for that folder.
  - Do **not** add a `cloudflared` target in app scripts; use repo-root tunnel scripts instead.
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

### ViajeChavales Postgres password and `DATABASE_URL`

`ViajeChavales/docker-compose.yml` builds `DATABASE_URL` from the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` as the `db` service. **Keep those values consistent** in the secret `DEPLOY_ENV_VIAJECHAVALES` (and in any local `.env`).

Postgres initializes its data directory **only on first start** of a new volume. If you change `POSTGRES_PASSWORD` in CI without recreating the volume (and without `ALTER USER` inside Postgres), the stored role password can drift from what the backend uses; Prisma then fails with **P1000** (authentication failed). Align password + `DATABASE_URL`, or recreate the volume (data loss) or run a controlled password reset.

See `ViajeChavales/.env.example` and [server-bootstrap.md](server-bootstrap.md) for new-server and migration notes.

### Database persistence and destructive actions (mandatory)

- Databases must use named Docker volumes for persistence.
- Normal deploy/redeploy flows must not remove DB volumes.
- Do not run volume-destructive teardown unless you have explicit maintenance intent and a backup/restore plan.
- In this repo, destructive volume removal is guarded and requires an explicit flag (`--allow-db-volume-removal`).

### Shared Cloudflare tunnel token (local private doc)

For this repo, the commonly used Cloudflare tunnel token is stored in:
- `docs/private/cloudflare-shared-token.local.md`

Rules:
- keep this file local only (never tracked/pushed),
- copy `CLOUDFLARED_TUNNEL_TOKEN` into `infra/cloudflare-tunnel/.env` (primary); per-app `.env` may still carry `CLOUDFLARE_PUBLIC_HOSTNAME`,
- keep `CLOUDFLARE_PUBLIC_HOSTNAME` unique per app route.

## 5) Cloudflare model used here

- Preferred for production: named tunnel + token (`CLOUDFLARED_TUNNEL_TOKEN`).
- Quick tunnel (`trycloudflare.com`) only for temporary demo/testing.
- One tunnel can route multiple apps by hostnames.
- Keep a unique hostname per app (example: `trips.devogs.com`).
- On one host, run a single `cloudflared` connector process for that named tunnel.
- In this repo the connector is **`pws-cloudflared`** (`infra/cloudflare-tunnel/docker-compose.yml`), started via `scripts/deploy-cloudflare-tunnel.*`.
- Other apps publish through the shared ingress (`devogs-ingress` on `devogs_edge`); do not run a second connector for the same tunnel.

### 5.1) Zero Trust route configuration (required)

In **Cloudflare Zero Trust → Tunnels → [tunnel] → Public hostname routes**, every hostname that should hit this monorepo must use the **same origin**:

| Public hostname (examples) | Service URL (HTTP) |
|----------------------------|---------------------|
| `devogs.com` (apex / landing) | `http://devogs-ingress:80` |
| `trips.devogs.com` | `http://devogs-ingress:80` |
| `gael-games.devogs.com` | `http://devogs-ingress:80` |
| `sergio-elias.devogs.com` | `http://devogs-ingress:80` |
| `kuma.devogs.com` | `http://devogs-ingress:80` |

The **shared ingress** stack ([`infra/ingress/`](infra/ingress/)) runs Nginx on `devogs_edge` with alias **`devogs-ingress`**: it serves the **landing** on `devogs.com` and `proxy_pass`es by `Host` to **`trips-gateway`** (ViajeChavales), **`gael-games-gateway`**, **`portfolio-gateway`**, and **`pws-uptime-kuma:3001`** for `kuma.devogs.com`. Trips-only Nginx lives in ViajeChavales (`trips-gateway` alias); it is **not** the tunnel target.

**Do not** set the Service URL to `http://gateway:80` or `http://trips-gateway:80`: Cloudflare must use **`http://devogs-ingress:80`** only.
For `kuma.devogs.com`, require Cloudflare Access before enabling broad DNS exposure.

**Token file:** primary location is `infra/cloudflare-tunnel/.env`; see `infra/cloudflare-tunnel/.env.example`. Detailed steps: `ViajeChavales/docs/cloudflare-tunnel.md`.

### 5.2) Local vs public URLs

- **Local shared ingress (matches tunnel target):** `http://127.0.0.1:8090` by default (`INGRESS_PORT` in [`infra/ingress/.env.example`](infra/ingress/.env.example)). Test different sites with the `Host` header (e.g. `curl -H 'Host: trips.devogs.com' http://127.0.0.1:8090/`).
- **Local Trips stack only (bypass shared ingress):** `http://127.0.0.1:8091` with `APP_PORT` from `ViajeChavales/.env`.
- **Windows:** Port **80** is often bound by IIS (“Default Site”); that is unrelated to this stack. Use `127.0.0.1:8090` for full routing or `8091` for Trips only.

### 5.3) Full teardown / clean redeploy

From repo root:

- Linux/macOS: `bash scripts/teardown-pws-docker.sh` (optional `--rmi` to remove compose-built images).
- Windows: `.\scripts\teardown-pws-docker.ps1` (optional `-RemoveImages`).

The script brings down the **shared PWS** Cloudflare tunnel (`infra/cloudflare-tunnel` → **`pws-cloudflared`**) and force-removes that container if it still exists. It does **not** stop other `cloudflared` connectors on the same host (for example a dedicated tunnel in another repo). Then it brings down **`infra/ingress`**, then Portfolio / Gael-Games / ViajeChavales, and removes `devogs_edge` when possible. It can run **without** per-app `.env` files present (needed for CI checkouts). Then run `scripts/init-and-deploy-all.*` to bring everything back.

## 6) Deploy workflows

GitHub Actions workflow: `.github/workflows/deploy-selfhosted.yml`.

- **Push to `main`:** path-based deploy (only stacks that changed), including job **`deploy-ingress`** when `infra/ingress/**` or `landing/**` change. When at least one app or ingress deploy job succeeds, **`refresh-shared-tunnel-after-deploy`** runs last and redeploys `pws-cloudflared` (bootstrap runs are excluded: `init-and-deploy-all.sh` already deploys the tunnel once).
- **`workflow_dispatch` → `full_stack_deploy`:** full bootstrap on a new runner (writes all four `DEPLOY_ENV_*` secrets and runs `scripts/init-and-deploy-all.sh`). See [server-bootstrap.md](server-bootstrap.md).
- **`workflow_dispatch` → `refresh_tunnel`:** redeploy only `pws-cloudflared` without touching app stacks (skipped when `full_stack_deploy` is true; use this when you only need a tunnel recycle).

The `teardown-selfhosted` job runs only when **`force_teardown`** is set on `workflow_dispatch`, or on **push to `main`** when paths match **`infra_critical`** (compose, shared scripts, tunnel, workflow, etc.).

Policy: **teardown implies full redeploy**.
- If `teardown-selfhosted` succeeds, workflow executes `deploy-all-selfhosted` (`scripts/init-and-deploy-all.sh`) and skips path-based app/ingress jobs.
- If teardown is skipped, workflow uses normal path-based deploy jobs.

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

Use `backend`, `gateway`, or `all` as needed (and for static apps, `frontend|gateway|all` only).

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
- For a full 24/7 + secure remote SSH setup (power policy, Tailscale, SSH hardening), follow [`docs/server-24x7-ssh.md`](server-24x7-ssh.md).

## 9) Logs and retention (mandatory for published apps)

### What is logged by default

- `gateway` (nginx): HTTP access logs (routes, status, referer, user-agent, forwarded IP).
- `backend`: app/runtime logs, warnings/errors, socket events if printed by app.
- `db`: postgres internal logs.
- `pws-cloudflared`: tunnel connector health/reconnect logs (not in app compose; use `docker logs`).

By default Docker uses `json-file` driver, logs are separated per container.
Risk is disk growth over time (not RAM growth).

### How to read logs (per app and per service)

From app folder:

Linux/macOS:
```bash
docker compose --env-file .env logs -f gateway
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs --tail 200
docker logs -f pws-cloudflared
```

Windows PowerShell:
```powershell
docker compose --env-file .env logs -f gateway
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs --tail 200
docker logs -f pws-cloudflared
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

Use the same logging block for `backend` and `db`. For the tunnel container, set logging in `infra/cloudflare-tunnel/docker-compose.yml` if you need rotation.

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
2. Mandatory script contract exists (`init-app*`, `deploy-part*`, `init-and-deploy*` where used); tunnel is repo-root `deploy-cloudflare-tunnel.*` if public.
3. App has `docker-compose.yml` with partial service redeploy support.
4. `.github/workflows/deploy-selfhosted.yml` includes path filters and deploy steps for that app.
5. `docs/apps-active-registry.md` row exists with ports/routes/tunnel mode/status.
6. Dry run passes on target host:
   - `./init-app(.ps1)`
   - `./scripts/deploy-part.* frontend`
   - optional `PWs/scripts/deploy-cloudflare-tunnel.*` on the host

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

## 13) Monitoring and alerts baseline (Phase 2)

Use Uptime Kuma as the default lightweight monitoring stack for this repo:

- Stack location: `infra/monitoring/`
- Start: `bash infra/monitoring/up.sh`
- Stop: `bash infra/monitoring/down.sh`
- Local UI: `http://127.0.0.1:3001` (keep private; prefer SSH tunnel access)

Baseline monitors:
- host reachability via Tailscale ping,
- public apex domain (`https://devogs.com`),
- shared ingress local check (`http://host.docker.internal:8090`),
- public app domains:
  - `https://trips.devogs.com`
  - `https://gael-games.devogs.com`
  - `https://sergio-elias.devogs.com`

Default thresholds:
- interval `60s`,
- timeout `10s`,
- retries `3`,
- recovery notifications enabled.

Alert channel (Phase 2 default):
- Telegram as primary notification integration.

For complete setup, acceptance test, and alert-to-diagnosis flow:
- `docs/monitoring-runbook.md`

CI/bootstrap policy for Uptime Kuma:
- Push deploys do not restart Kuma by default.
- In `.github/workflows/deploy-selfhosted.yml`, the final job recreates Kuma only when `infra/monitoring/**` changed.
- In `scripts/init-and-deploy-all.sh`, Kuma is checked as the last step:
  - if `pws-uptime-kuma` is already running, it is left untouched,
  - if not running (and monitoring stack exists), `infra/monitoring/up.sh` is executed.

## 14) Phase 3 scope (logs + CLI tools, no headless)

This phase focuses on operational readiness over SSH without changing desktop mode.

Included now:
- log rotation standardization across compose services,
- logging quick map per stack/service,
- CLI tools runbook for `codex`, `cursor`, and `open code` resolution.

Deferred to final phase:
- switching system target to `multi-user.target`,
- disabling display manager / GUI,
- persistent session setup (`tmux`, `zsh`, alias packs).

Reference docs:
- `docs/logging-runbook.md`
- `docs/apps-active-registry.md`
- `docs/cli-tools-runbook.md`

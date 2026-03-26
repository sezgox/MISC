# Active Apps Registry (PWs)

Source of truth for active apps, ports, domains, and deploy entrypoints.
Update this file whenever an app gets bootstrap/deploy scripts or changes host config.

## Status values

- `active`: currently serving or ready for immediate start with existing scripts/env.
- `inactive`: app exists but not currently served.
- `planned`: target app to be onboarded next.

## Active apps

| App | Status | Repo path | Local entry | Host ports | Public routes | Tunnel mode | Deploy entrypoints |
|---|---|---|---|---|---|---|---|
| Shared ingress | active | `infra/ingress/` | `http://127.0.0.1:8090` | `host:8090 -> ingress gateway:80`; alias **`devogs-ingress`** on `devogs_edge` | `https://devogs.com` (landing), proxies to `trips-gateway`, `gael-games-gateway`, `portfolio-gateway` | Same tunnel; Cloudflare → **`http://devogs-ingress:80`** | `infra/ingress/up.sh`; `init-and-deploy-all.*` starts it after app stacks; workflow job `deploy-ingress` on `infra/ingress/**` or `landing/**` |
| Monitoring (Uptime Kuma) | active | `infra/monitoring/` | `http://127.0.0.1:3001` | `host:3001 -> uptime-kuma:3001` | `https://kuma.devogs.com` (via shared ingress + Cloudflare Access) | Same tunnel via `devogs-ingress`; Access required | `infra/monitoring/up.sh`, `infra/monitoring/down.sh`; monitor setup in `docs/monitoring-runbook.md` |
| ViajeChavales (Trips) | active | `ViajeChavales/` | `http://127.0.0.1:8091` | `host:8091 -> trips-gateway:80` (`APP_PORT`); alias **`trips-gateway`** on `devogs_edge` | `https://trips.devogs.com` (vía ingress compartido) | Tunnel targets **`devogs-ingress`** only; do not point Cloudflare at `trips-gateway` | `init-app(.ps1)`, `deploy-part`: `frontend\|backend\|gateway\|all`, `init-and-deploy.*` |
| Landing (apex) | active | `landing/` | static files mounted in `infra/ingress` | shares **8090** with shared ingress | `https://devogs.com` | Same tunnel → `devogs-ingress` | deploy: `deploy-ingress` / `infra/ingress/up.sh` (not ViajeChavales) |
| Portfolio | active | `Portfolio/` | `http://127.0.0.1:8093` | `host:8093 -> portfolio-gateway:80` | `https://sergio-elias.devogs.com` | Mismo túnel (`pws-cloudflared`); Cloudflare → `devogs-ingress:80`; Nginx ingress → `portfolio-gateway:80` en `devogs_edge` | `Portfolio/init-app(.ps1)`, `deploy-part`: `frontend\|gateway\|all`; túnel: raíz `scripts/deploy-cloudflare-tunnel.*` |
| Gael-Games | active (ready for start/deploy scripts) | `Gael-Games/` | `http://127.0.0.1:8092` | `host:8092 -> gael-games-gateway:80` | `https://gael-games.devogs.com` | Mismo túnel (`pws-cloudflared`); Cloudflare → `devogs-ingress:80`; Nginx ingress → `gael-games-gateway:80` en `devogs_edge` | `init-app(.ps1)`, `deploy-part`: `frontend\|gateway\|all`, `init-and-deploy.*`; túnel: raíz `scripts/deploy-cloudflare-tunnel.*` |

**Cloudflare checklist:** Every public hostname in Zero Trust must use **Service URL** `http://devogs-ingress:80`. See `ViajeChavales/docs/cloudflare-tunnel.md` section 6.1 if subdomains show the wrong app.

**Workflow policy note:** if CI performs `teardown-selfhosted`, recovery is now full-only (`deploy-all-selfhosted` via `init-and-deploy-all.sh`); path-based app jobs are skipped in that run.

## Current host port reservations (observed)

Run to verify in real time:
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Known from current machine state:
- `8090` reserved by shared ingress (`infra/ingress`).
- `8091` reserved by ViajeChavales `trips-gateway`.
- `8092` reserved for `gael-games-gateway` stack.
- `8093` reserved for `portfolio` stack (Astro static + nginx gateway).
- `5432` exposed by `venteweb-postgres-1` (not part of ViajeChavales stack).

## Logging snapshot (current)

- ViajeChavales containers are using Docker `json-file` logs.
- Logs are separated by container (`gateway`, `backend`, `frontend`, `db`; el túnel es `pws-cloudflared` en `infra/cloudflare-tunnel/`).
- Rotation limits are now declared in active stacks with laptop baseline (`max-size: "10m"`, `max-file: "3"`).

Quick verification:
```bash
docker inspect viajechavales-gateway-1 --format "Driver={{.HostConfig.LogConfig.Type}}; Options={{json .HostConfig.LogConfig.Config}}"
```

## Logging quick map (Phase 3)

- Shared ingress (`infra/ingress`):
  - container/service: `gateway` (`devogs-ingress`)
  - read logs: `docker compose -f infra/ingress/docker-compose.yml logs -f gateway`
- Shared tunnel (`infra/cloudflare-tunnel`):
  - container: `pws-cloudflared`
  - read logs: `docker logs -f pws-cloudflared`
- Monitoring (`infra/monitoring`):
  - container: `pws-uptime-kuma`
  - read logs: `docker logs -f pws-uptime-kuma`
- ViajeChavales:
  - services: `gateway`, `backend`, `db`
  - read logs: `docker compose --env-file ViajeChavales/.env -f ViajeChavales/docker-compose.yml logs -f gateway backend db`
- Gael-Games:
  - services: `gateway`, `frontend`
  - read logs: `docker compose --env-file Gael-Games/.env -f Gael-Games/docker-compose.yml logs -f gateway frontend`
- Portfolio:
  - services: `gateway`, `frontend`
  - read logs: `docker compose --env-file Portfolio/.env -f Portfolio/docker-compose.yml logs -f gateway frontend`

## No-overlap rules

1. Every new app must reserve a unique host HTTP port (`APP_PORT`) if running locally behind host port mapping.
2. Avoid exposing DB to host unless required for external tools.
3. If DB must be exposed, allocate unique host DB port and register it here.
4. Cloudflare hostname must be unique per app route.
5. Keep one row per app/service entry in this file before first production deploy.
6. DB services must use named volumes; destructive volume removal requires explicit maintenance mode plus backup.

## New app onboarding template (copy/paste)

```md
| <AppName> | active/inactive/planned | `<folder>/` | `http://127.0.0.1:<port>` | `<hostPort> -> <servicePort>` | `https://<sub>.<domain>` | named/quick/none | `init-app(.ps1)`, `scripts/deploy-part.*`, `scripts/init-and-deploy.*` |
```

## Mandatory update trigger

Whenever one of these is created/changed in any app:
- `init-app` or `init-app.ps1`,
- `infra/ingress/docker-compose.yml` or `infra/ingress/default.conf`,
- `scripts/deploy-part.*`,
- `scripts/init-and-deploy.*`,
- Cloudflare tunnel scripts/config/routes,

then update this registry in the same commit (or immediate next commit).

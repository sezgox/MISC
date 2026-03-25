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
| ViajeChavales | active | `ViajeChavales/` | `http://127.0.0.1:8091` | `host:8091 -> viajechavales-gateway:80` (see `APP_PORT`) | `https://trips.devogs.com`, `https://devogs.com` | Named tunnel: `infra/cloudflare-tunnel/.env`; Cloudflare routes must target **`http://devogs-ingress:80`** (not `gateway:80`); Docker network `devogs_edge`, ingress alias `devogs-ingress` | `init-app(.ps1)`, `deploy-part`: `frontend\|backend\|gateway\|all`, `init-and-deploy.*`; túnel: raíz `scripts/deploy-cloudflare-tunnel.*`, `scripts/init-and-deploy-all.*` |
| Landing (default domain) | active (served via ViajeChavales gateway) | `landing/` | served by `ViajeChavales/infra/nginx/default.conf` | shares `8091` via gateway | `https://devogs.com` (+ unknown routes redirected to root) | Same named tunnel as ViajeChavales | deploy with `ViajeChavales/scripts/deploy-part.* gateway` |
| Portfolio | active | `Portfolio/` | `http://127.0.0.1:8093` | `host:8093 -> portfolio-gateway:80` | `https://sergio-elias.devogs.com` | Mismo túnel (`pws-cloudflared`); Cloudflare → `devogs-ingress:80`; Nginx ingress → `portfolio-gateway:80` en `devogs_edge` | `Portfolio/init-app(.ps1)`, `deploy-part`: `frontend\|gateway\|all`; túnel: raíz `scripts/deploy-cloudflare-tunnel.*` |
| Gael-Games | active (ready for start/deploy scripts) | `Gael-Games/` | `http://127.0.0.1:8092` | `host:8092 -> gael-games-gateway:80` | `https://gael-games.devogs.com` | Mismo túnel (`pws-cloudflared`); Cloudflare → `devogs-ingress:80`; Nginx ingress → `gael-games-gateway:80` en `devogs_edge` | `init-app(.ps1)`, `deploy-part`: `frontend\|gateway\|all`, `init-and-deploy.*`; túnel: raíz `scripts/deploy-cloudflare-tunnel.*` |

**Cloudflare checklist:** Every public hostname in Zero Trust must use **Service URL** `http://devogs-ingress:80`. See `ViajeChavales/docs/cloudflare-tunnel.md` section 6.1 if subdomains show the wrong app.

## Current host port reservations (observed)

Run to verify in real time:
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Known from current machine state:
- `8091` reserved by `viajechavales-gateway-1`.
- `8092` reserved for `gael-games-gateway` stack.
- `8093` reserved for `portfolio` stack (Astro static + nginx gateway).
- `5432` exposed by `venteweb-postgres-1` (not part of ViajeChavales stack).

## Logging snapshot (current)

- ViajeChavales containers are using Docker `json-file` logs.
- Logs are separated by container (`gateway`, `backend`, `frontend`, `db`; el túnel es `pws-cloudflared` en `infra/cloudflare-tunnel/`).
- Rotation limits are not yet declared in `ViajeChavales/docker-compose.yml` (recommended to add before long VPS uptime).

Quick verification:
```bash
docker inspect viajechavales-gateway-1 --format "Driver={{.HostConfig.LogConfig.Type}}; Options={{json .HostConfig.LogConfig.Config}}"
```

## No-overlap rules

1. Every new app must reserve a unique host HTTP port (`APP_PORT`) if running locally behind host port mapping.
2. Avoid exposing DB to host unless required for external tools.
3. If DB must be exposed, allocate unique host DB port and register it here.
4. Cloudflare hostname must be unique per app route.
5. Keep one row per app/service entry in this file before first production deploy.

## New app onboarding template (copy/paste)

```md
| <AppName> | active/inactive/planned | `<folder>/` | `http://127.0.0.1:<port>` | `<hostPort> -> <servicePort>` | `https://<sub>.<domain>` | named/quick/none | `init-app(.ps1)`, `scripts/deploy-part.*`, `scripts/init-and-deploy.*` |
```

## Mandatory update trigger

Whenever one of these is created/changed in any app:
- `init-app` or `init-app.ps1`,
- `scripts/deploy-part.*`,
- `scripts/init-and-deploy.*`,
- Cloudflare tunnel scripts/config/routes,

then update this registry in the same commit (or immediate next commit).

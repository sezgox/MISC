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
| ViajeChavales | active | `ViajeChavales/` | `http://127.0.0.1:8091` | `8091 -> gateway:80` | `https://trips.devogs.com`, `https://devogs.com` | Named Cloudflare tunnel (`cloudflared` profile, token in `.env`) | `init-app(.ps1)`, `scripts/deploy-part.*`, `scripts/init-and-deploy.*`, `scripts/start-cloudflare-tunnel.*`, `scripts/refresh-cloudflare-tunnel.*` |
| Landing (default domain) | active (served via ViajeChavales gateway) | `landing/` | served by `ViajeChavales/infra/nginx/default.conf` | shares `8091` via gateway | `https://devogs.com` (+ unknown routes redirected to root) | Same named tunnel as ViajeChavales | deploy with `ViajeChavales/scripts/deploy-part.* gateway` |
| Portfolio | planned | `Portfolio/` | not assigned yet | not assigned yet | planned: subdomain pending | pending | pending |
| Gael-Games | active (ready for start/deploy scripts) | `Gael-Games/` | `http://127.0.0.1:8092` | `8092 -> gateway:80` | `https://gael-games.devogs.com` | Shared named tunnel (single connector managed by `ViajeChavales/cloudflared`) | `init-app(.ps1)`, `scripts/deploy-part.*`, `scripts/init-and-deploy.*` |

## Current host port reservations (observed)

Run to verify in real time:
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Known from current machine state:
- `8091` reserved by `viajechavales-gateway-1`.
- `8092` reserved for `gael-games-gateway` stack.
- `5432` exposed by `venteweb-postgres-1` (not part of ViajeChavales stack).

## Logging snapshot (current)

- ViajeChavales containers are using Docker `json-file` logs.
- Logs are separated by container (`gateway`, `backend`, `frontend`, `db`, `cloudflared`).
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

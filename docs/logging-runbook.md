# Logs Runbook For Published Apps

This runbook defines how logs must be handled when apps are hosted from:
- personal laptop (self-hosted),
- VPS (always-on production-like host).

## 1) What logs exist by default

With Docker Compose default config, each container writes logs using `json-file`.
Logs are separated by container, so separation by app comes naturally through compose project names and container names.

Typical services:
- `gateway` (nginx): HTTP access logs (route, status, referer, user-agent, forwarded IP).
- `backend`: app logs/errors/runtime events.
- `frontend`: SSR/startup logs (usually low volume).
- `db`: Postgres internal logs.
- `pws-cloudflared`: tunnel health/reconnect logs (shared connector, not in each app compose).

Important:
- Main risk is disk usage growth, not RAM usage growth.

## 2) Read logs per app

From app folder (`PWs/<AppName>`):

Linux/macOS:
```bash
docker compose --env-file .env logs -f gateway
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs --tail 200
```

Windows PowerShell:
```powershell
docker compose --env-file .env logs -f gateway
docker compose --env-file .env logs -f backend
docker compose --env-file .env logs --tail 200
```

For the shared Cloudflare tunnel connector:
```bash
docker logs -f pws-cloudflared
```

## 3) Locate raw log files

Get physical log file path for one container:
```bash
docker inspect <container_name> --format "{{.LogPath}}"
```

Check current log driver/options:
```bash
docker inspect <container_name> --format "Driver={{.HostConfig.LogConfig.Type}}; Options={{json .HostConfig.LogConfig.Config}}"
```

## 4) Retention policy (recommended)

Laptop self-hosting:
- `max-size: "10m"`
- `max-file: "3"`

VPS always-on:
- `max-size: "25m"`
- `max-file: "5"`

Add this to each important service in `docker-compose.yml`:

```yaml
logging:
  driver: json-file
  options:
    max-size: "25m"
    max-file: "5"
```

Minimum recommended services with retention:
- `gateway`
- `backend`
- `db`
- `pws-cloudflared` (tunnel stack)

## 5) Operational checks

See active containers:
```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

If a service is too noisy, redeploy only that service:
```bash
docker compose --env-file .env up -d --force-recreate <service>
```

For app-level separation:
- keep one compose project per app (`docker compose` from each app folder),
- avoid mixing unrelated app services in one compose file unless intentional.

## 6) Policy for this repo

When onboarding a new published app:
1. Add log commands to its app docs.
2. Add/confirm rotation in its compose file.
3. Register app in `docs/apps-active-registry.md`.

## 7) Cross-runbook with monitoring alerts

When a monitor alert is received, use this document for log triage and pair it with:
- `docs/monitoring-runbook.md` for alert classification and first-response commands.

Fast path:
1. Identify failing monitor (host, ingress, or app domain).
2. Validate container state:
   - `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`
3. Review high-value logs:
   - `docker logs --tail 200 pws-cloudflared`
   - `docker compose -f infra/ingress/docker-compose.yml logs --tail 200 gateway`
   - app-specific `docker compose --env-file .env logs --tail 200 <service>`
4. Recover only the impacted layer first (tunnel, ingress, or app target).

## 8) Phase 3 standardization policy

Use one explicit logging block for all critical services:
- app stacks: `gateway`, `backend`, `db`
- shared stacks: `pws-cloudflared`, `devogs-ingress`, `pws-uptime-kuma` (when desired)

Baseline profile by host type:
- laptop self-hosting:
  - `max-size: "10m"`
  - `max-file: "3"`
- always-on VPS/server:
  - `max-size: "25m"`
  - `max-file: "5"`

Reference block:
```yaml
logging:
  driver: json-file
  options:
    max-size: "25m"
    max-file: "5"
```

Apply this block directly in every relevant `docker-compose.yml` service.

## 9) Audit checklist (before/after rollout)

1. Confirm driver/options on each critical container:
```bash
docker inspect <container_name> --format "Driver={{.HostConfig.LogConfig.Type}}; Options={{json .HostConfig.LogConfig.Config}}"
```
2. Confirm log files exist and are bounded over time:
```bash
docker inspect <container_name> --format "{{.LogPath}}"
```
3. Confirm noisy services are rotated by recreating only target service:
```bash
docker compose --env-file .env up -d --force-recreate <service>
```
4. Record findings in ops notes and update `docs/apps-active-registry.md` if stack layout changed.

## 10) HTTP traffic quick commands (Phase 3)

Use these three commands as first-line checks:

1. Global web traffic through shared ingress:
```bash
docker compose -f infra/ingress/docker-compose.yml logs -f --tail 200 gateway
```

2. App-specific traffic (filter by `Host` in ingress logs):
```bash
docker compose -f infra/ingress/docker-compose.yml logs --tail 400 gateway | rg "trips.devogs.com|gael-games.devogs.com|sergio-elias.devogs.com|devogs.com"
```

3. Backend errors/warnings (example ViajeChavales backend):
```bash
docker compose --env-file ViajeChavales/.env -f ViajeChavales/docker-compose.yml logs -f --tail 200 backend
```


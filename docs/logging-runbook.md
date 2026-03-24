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


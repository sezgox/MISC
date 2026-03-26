# Monitoring Runbook (Phase 2)

This runbook defines the baseline monitoring and alerting setup for the self-hosted stack using Uptime Kuma.

## 1) Stack location and lifecycle

- Compose stack: `infra/monitoring/docker-compose.yml`
- Optional env file: `infra/monitoring/.env` (copy from `.env.example`)
- Start/recreate:
  - `bash infra/monitoring/up.sh`
- Stop:
  - `bash infra/monitoring/down.sh`

Default UI URL from host:
- `http://127.0.0.1:3001`

## 2) Access policy

Recommended production access:
- publish `kuma.devogs.com` through the shared tunnel origin (`http://devogs-ingress:80`),
- protect it with Cloudflare Access (required),
- keep SSH tunnel as fallback access path.

SSH fallback:

```bash
ssh -L 3001:127.0.0.1:3001 sezgox@<tailscale-ip-or-hostname>
```

Then open:
- `http://127.0.0.1:3001`

Cloudflare dashboard steps (manual):
1. Zero Trust -> Tunnels -> Public hostnames:
   - `kuma.devogs.com` -> `http://devogs-ingress:80`
2. Zero Trust -> Access -> Applications:
   - app: `https://kuma.devogs.com`
   - policy: allow only authorized emails/groups.

## 3) Baseline monitors to create

Create these monitors from the Uptime Kuma UI after first login.

### Host and ingress

1. `host-tailscale-ping`
   - Type: `Ping`
   - Hostname: `<TAILSCALE_HOST_IP>`
   - Interval: `60s`
   - Retry: `3`
   - Timeout: `10s`

2. `host-public-http-devogs`
   - Type: `HTTP(s)`
   - URL: `https://devogs.com/`
   - Method: `GET`
   - Accepted status codes: `200-399`
   - Interval: `60s`
   - Retry: `3`
   - Timeout: `10s`

3. `ingress-local-http`
   - Type: `HTTP(s)`
   - URL: `http://host.docker.internal:8090/`
   - Method: `GET`
   - Accepted status codes: `200-399`
   - Optional Header (for explicit vhost check):
     - `Host: devogs.com`
   - Interval: `60s`
   - Retry: `3`
   - Timeout: `10s`

### Public apps by domain

4. `trips-domain-http`
   - Type: `HTTP(s)`
   - URL: `https://trips.devogs.com/`
   - Method: `GET`
   - Accepted status codes: `200-399`
   - Interval: `60s`
   - Retry: `3`
   - Timeout: `10s`

5. `gael-games-domain-http`
   - Type: `HTTP(s)`
   - URL: `https://gael-games.devogs.com/`
   - Method: `GET`
   - Accepted status codes: `200-399`
   - Interval: `60s`
   - Retry: `3`
   - Timeout: `10s`

6. `portfolio-domain-http`
   - Type: `HTTP(s)`
   - URL: `https://sergio-elias.devogs.com/`
   - Method: `GET`
   - Accepted status codes: `200-399`
   - Interval: `60s`
   - Retry: `3`
   - Timeout: `10s`

Optional monitor:
- `cloudflared-local-health`
  - Type: `HTTP(s)` or `TCP Port`
  - Target: choose only if you expose a stable local health target for `pws-cloudflared`.
  - If no explicit endpoint exists, rely on the domain checks above and `docker logs pws-cloudflared`.

## 4) Telegram notifications

1. Create a Telegram bot with BotFather and copy the bot token.
2. Get your target chat ID (user chat or group chat).
3. In Uptime Kuma:
   - `Settings` -> `Notifications` -> `Setup Notification`
   - Select `Telegram`
   - Fill `Bot Token` and `Chat ID`
   - Enable notification for both:
     - monitor down,
     - monitor up (recovery).
4. Test notification from the same screen before assigning it to all monitors.

Recommended:
- Create one notification profile `telegram-primary`.
- Attach it to all baseline monitors.

## 5) Acceptance test (must pass)

1. All baseline monitors report `UP`.
2. Controlled failure:
   - Stop ingress temporarily:
     - `docker compose -f infra/ingress/docker-compose.yml stop gateway`
3. Validate:
   - Telegram receives `DOWN` alert for ingress/domain checks.
4. Recover:
   - `docker compose -f infra/ingress/docker-compose.yml start gateway`
5. Validate:
   - Telegram receives `RECOVERY` alert.
6. Restore normal state and verify all monitors are `UP`.

## 6) Alert-to-diagnosis workflow

When alert arrives:

1. Identify affected monitor type:
   - Ping only failing -> host/network reachability issue.
   - Public domain checks failing but ping OK -> tunnel/ingress/routing issue.
   - Single app domain failing -> app-specific gateway/app issue.
2. Run quick triage:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker logs --tail 200 pws-cloudflared
docker compose -f infra/ingress/docker-compose.yml ps
curl -I http://127.0.0.1:8090/
curl -I -H 'Host: trips.devogs.com' http://127.0.0.1:8090/
curl -I -H 'Host: gael-games.devogs.com' http://127.0.0.1:8090/
curl -I -H 'Host: sergio-elias.devogs.com' http://127.0.0.1:8090/
```

3. If tunnel issues are suspected, refresh connector:

```bash
bash scripts/deploy-cloudflare-tunnel.sh
```

4. If ingress issues are suspected:

```bash
bash infra/ingress/up.sh
```

5. If app-specific issue:
   - redeploy only impacted app target using its `deploy-part` script.

## 7) Noise control and maintenance windows

- Keep `60s / retry 3 / timeout 10s` as initial baseline.
- If false positives occur, increase timeout first (for example to `15s`) before increasing interval.
- During planned maintenance:
  - pause impacted monitors in Uptime Kuma, or
  - temporarily disable notification profile assignment.

## 8) Related docs

- Main playbook: `docs/hosting-playbook.md`
- Logs troubleshooting: `docs/logging-runbook.md`
- Host hardening and SSH baseline: `docs/server-24x7-ssh.md`

## 9) Automatic restart policy (CI and bootstrap)

- Path-based push deploys:
  - Uptime Kuma is recreated only when files under `infra/monitoring/**` change.
  - This recreation is executed from the final workflow job (`refresh-shared-tunnel-after-deploy`).
- Full bootstrap (`scripts/init-and-deploy-all.sh`):
  - Kuma is handled as the last step.
  - If `pws-uptime-kuma` is already running, no restart is performed.
  - If it is not running and monitoring stack files exist, `bash infra/monitoring/up.sh` is executed.

## 10) Tunnel + ingress validation for Kuma

1. Ensure ingress and monitoring are up:
```bash
docker compose -f infra/ingress/docker-compose.yml ps
docker compose -f infra/monitoring/docker-compose.yml ps
```
2. Validate local ingress route:
```bash
curl -I -H 'Host: kuma.devogs.com' http://127.0.0.1:8090/
```
3. Validate public route behavior:
- unauthorized session -> blocked by Cloudflare Access,
- authorized session -> access granted to Kuma UI.

# Deployment Runbook (Windows + Linux)

This runbook explains how to:

- deploy the full app,
- publish it through Cloudflare Tunnel,
- deploy only one part (`frontend` or `backend`) after `git pull`,
- reuse the same process on Windows now and Linux later.

## 1) First deploy (full stack + tunnel)

Requirements:

- Docker + Docker Compose installed.
- `ViajeChavales/.env` created with:
  - `POSTGRES_*`
  - `JWT_*`
  - `CLOUDFLARED_TUNNEL_TOKEN`
  - optional: `CLOUDFLARE_PUBLIC_HOSTNAME`

### Windows (PowerShell)

```powershell
cd C:\Users\hijue\OneDrive\Escritorio\PWs\ViajeChavales
.\scripts\init-and-deploy.ps1
```

### Linux

```bash
cd /path/to/ViajeChavales
bash ./scripts/init-and-deploy.sh
```

What this does:

1. starts app services (`db`, `backend`, `frontend`, `gateway`),
2. starts `cloudflared`,
3. prints public URL when `CLOUDFLARE_PUBLIC_HOSTNAME` is set.

## 2) Deploy after code changes (without stopping DB)

After updating code:

### Windows

```powershell
git pull
.\scripts\deploy-part.ps1 -Target frontend
```

or

```powershell
git pull
.\scripts\deploy-part.ps1 -Target backend
```

### Linux

```bash
git pull
bash ./scripts/deploy-part.sh frontend
```

or

```bash
git pull
bash ./scripts/deploy-part.sh backend
```

Important:

- `frontend` deploy does not stop `backend` or `db`.
- `backend` deploy does not stop `db`.
- Tunnel connector is unaffected unless you deploy `cloudflared`.

## 3) Deploy targets reference

### Windows

```powershell
.\scripts\deploy-part.ps1 -Target frontend
.\scripts\deploy-part.ps1 -Target backend
.\scripts\deploy-part.ps1 -Target gateway
.\scripts\deploy-part.ps1 -Target cloudflared
.\scripts\deploy-part.ps1 -Target all
```

### Linux

```bash
bash ./scripts/deploy-part.sh frontend
bash ./scripts/deploy-part.sh backend
bash ./scripts/deploy-part.sh gateway
bash ./scripts/deploy-part.sh cloudflared
bash ./scripts/deploy-part.sh all
```

## 4) Tunnel operations

Start tunnel only:

- Windows:

```powershell
.\scripts\start-cloudflare-tunnel.ps1
```

- Linux:

```bash
bash ./scripts/start-cloudflare-tunnel.sh
```

Fast tunnel refresh after changing routes in Cloudflare dashboard:

- Windows:

```powershell
.\scripts\refresh-cloudflare-tunnel.ps1
```

- Linux:

```bash
bash ./scripts/refresh-cloudflare-tunnel.sh
```

Show logs on start:

- Windows:

```powershell
.\scripts\start-cloudflare-tunnel.ps1 -ShowLogs
```

- Linux:

```bash
bash ./scripts/start-cloudflare-tunnel.sh --show-logs
```

Live logs any time:

```bash
docker compose --env-file .env --profile cloudflare logs -f cloudflared
```

## 5) Health checks

Check running services:

```bash
docker compose --env-file .env --profile cloudflare ps
```

Local app:

- UI: `http://127.0.0.1:8091`
- API: `http://127.0.0.1:8091/api/`

Public app:

- `https://<your-cloudflare-hostname>`

## 6) After reboot (Windows/Linux)

In most cases you only need to start Docker Desktop / Docker Engine.

Reason:
- all services in this stack use `restart: unless-stopped`,
- containers should come back automatically after Docker starts.

Quick check:

```bash
docker compose --env-file .env --profile cloudflare ps
```

If any service is not running, start them explicitly:

```bash
docker compose --env-file .env up -d
docker compose --env-file .env --profile cloudflare up -d cloudflared
```

Or use the one-shot script:

- Windows:

```powershell
.\scripts\init-and-deploy.ps1
```

- Linux:

```bash
bash ./scripts/init-and-deploy.sh
```

## 7) Notes for moving to a Linux server

Use the same repo/scripts. Only paths and shell change.

Recommended:

1. Create a dedicated tunnel token for that server.
2. Set server-specific `.env` values.
3. Run:
   - `bash ./scripts/init-and-deploy.sh`
4. Keep Windows and Linux with separate tunnel connectors/tokens.

## 8) Linux server hardening and no-GUI mode

If this laptop/server will be dedicated to hosting, use headless mode to save RAM.

On Debian/Ubuntu:

```bash
sudo systemctl set-default multi-user.target
sudo systemctl disable --now gdm3 lightdm sddm 2>/dev/null || true
```

Revert to desktop later:

```bash
sudo systemctl set-default graphical.target
```

## 9) Port/conflict checklist

Before running multiple apps:

1. Inspect occupied ports:

```bash
sudo ss -tulpn | grep -E ':80|:443|:5432|:8091|:8092'
```

2. Stop local host services that clash with your chosen host ports:
- nginx/apache if using `80/443`,
- host postgres only if you map containers to `5432`.

3. Prefer not exposing DB ports to host unless required.
- Internal app-to-db traffic works through Docker network.
- This avoids collisions between multiple projects.

## 10) CI/CD (changed folders -> partial deploy)

Repository workflow:
- `../.github/workflows/deploy-selfhosted.yml` (repo root: `.github/workflows/deploy-selfhosted.yml`)

What it does on each push to `main`:

1. Detects which folders changed.
2. If only frontend changed -> redeploy frontend.
3. If only backend changed -> redeploy backend.
4. If nginx/landing changed -> redeploy gateway.
5. If stack scripts/compose changed -> redeploy full app + tunnel.

Requirements on server:

1. Self-hosted GitHub runner (Linux) installed and running.
2. Docker available for runner user (`docker` group).
3. `ViajeChavales/.env` present in runner workspace.

If your runner workspace is ephemeral, rebuild `.env` from secrets before deploy.

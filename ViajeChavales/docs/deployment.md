# Deployment Runbook (Windows + Linux)

This runbook explains how to:

- deploy the full app,
- publish it through Cloudflare Tunnel,
- deploy only one part (`frontend` or `backend`) after `git pull`,
- reuse the same process on Windows now and Linux later.

## 1) First deploy (full stack + tunnel)

Requirements:

- Docker + Docker Compose installed.
- `ViajeChavales/.env` with `POSTGRES_*`, `JWT_*`, optional `CLOUDFLARE_PUBLIC_HOSTNAME`.
- `infra/cloudflare-tunnel/.env` with `CLOUDFLARED_TUNNEL_TOKEN` (copy from `infra/cloudflare-tunnel/.env.example`).

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
2. starts the shared tunnel container `pws-cloudflared` via repo root `scripts/deploy-cloudflare-tunnel.*`,
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
- The tunnel connector is separate: redeploy it from repo root with `scripts/deploy-cloudflare-tunnel.*` (see section 4).

## 3) Deploy targets reference

### Windows

```powershell
.\scripts\deploy-part.ps1 -Target frontend
.\scripts\deploy-part.ps1 -Target backend
.\scripts\deploy-part.ps1 -Target gateway
.\scripts\deploy-part.ps1 -Target all
```

### Linux

```bash
bash ./scripts/deploy-part.sh frontend
bash ./scripts/deploy-part.sh backend
bash ./scripts/deploy-part.sh gateway
bash ./scripts/deploy-part.sh all
```

## 4) Tunnel operations

The connector is **not** part of this app’s compose file. It runs from `infra/cloudflare-tunnel/` and is started with repo-root scripts.

From **repo root** (`PWs/`):

- Windows:

```powershell
.\scripts\deploy-cloudflare-tunnel.ps1
```

- Linux / macOS:

```bash
bash scripts/deploy-cloudflare-tunnel.sh
```

After changing routes in the Cloudflare dashboard, run the same command again to recreate/restart `pws-cloudflared`.

Show recent tunnel logs after `init-and-deploy` (Windows): `.\scripts\init-and-deploy.ps1 -ShowLogs`

Live logs any time:

```bash
docker logs -f pws-cloudflared
```

## 5) Health checks

Check running services:

```bash
docker compose --env-file .env ps
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
docker compose --env-file .env ps
```

If any service is not running, start them explicitly:

```bash
docker compose --env-file .env up -d
```

If the public hostname does not respond, start or refresh the tunnel from repo root:

```bash
cd /path/to/PWs
bash scripts/deploy-cloudflare-tunnel.sh
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

## 11) SSH access for remote ops (recommended)

Goal: connect from laptop/mobile, inspect logs, and run quick deploy commands safely.

### Secure baseline on Linux server

1. Create deploy user:

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
```

2. Install SSH server:

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable --now ssh
```

3. Copy your public key to server:

```bash
ssh-copy-id deploy@<server-ip-or-host>
```

4. Harden sshd (`/etc/ssh/sshd_config`):
- `PermitRootLogin no`
- `PasswordAuthentication no`
- `PubkeyAuthentication yes`

Then reload:

```bash
sudo systemctl reload ssh
```

5. Firewall (UFW example):

```bash
sudo ufw allow OpenSSH
sudo ufw enable
```

If server is exposed to internet, also install `fail2ban`.

### Useful remote commands once connected

```bash
cd ~/MISC/ViajeChavales
bash ./scripts/ops.sh status
bash ./scripts/ops.sh logs backend
bash ./scripts/ops.sh logs cloudflared
bash ./scripts/deploy-part.sh frontend
bash ./scripts/deploy-part.sh backend
```

## 12) Codex CLI on server (your remote workflow)

Your plan is valid and common:

1. SSH to server.
2. Open `tmux` session.
3. Run Codex CLI in repo.
4. Apply small changes and push.

Recommended safety rules:

- Keep production edits small and targeted.
- Run partial deploy scripts, not full rebuild, unless required.
- Avoid editing `.env` from CI jobs.
- Keep one branch for urgent hotfixes.
- Always check `bash ./scripts/ops.sh status` after deploy.

## 13) Update default page (`devogs.com`) step by step

This is the quick flow for updating the default landing (the one served at `https://devogs.com`).

### Where to edit

- Landing files live outside this repo folder:
  - `../landing/index.html`
  - `../landing/styles.css`
  - static assets in `../landing/`

This app mounts that folder into nginx gateway:
- `docker-compose.yml` -> `../landing:/usr/share/nginx/html/landing:ro`

### Deploy only landing changes

After editing landing files, redeploy **gateway only**.

- Windows:

```powershell
cd C:\Users\hijue\OneDrive\Escritorio\PWs\ViajeChavales
.\scripts\deploy-part.ps1 -Target gateway
```

- Linux:

```bash
cd /path/to/ViajeChavales
bash ./scripts/deploy-part.sh gateway
```

### Verify (must pass)

1. `https://devogs.com` shows updated landing.
2. `https://trips.devogs.com` still loads Trips app.
3. Any unknown route under default domain redirects back to root:
   - `https://devogs.com/cualquier-cosa` -> `https://devogs.com/`

### Notes

- If only landing/nginx changed, do **not** redeploy backend/db.
- If Cloudflare route config changed in dashboard, refresh the connector from repo root: `bash scripts/deploy-cloudflare-tunnel.sh` or `.\scripts\deploy-cloudflare-tunnel.ps1`

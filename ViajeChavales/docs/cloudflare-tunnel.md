# Cloudflare Tunnel for ViajeChavales

This guide publishes the Docker app through Cloudflare Tunnel using a named tunnel token.

## 1) What you need

- A Cloudflare account.
- A domain already managed in Cloudflare DNS.
- Docker + Docker Compose on the host machine.
- This repo cloned with `ViajeChavales` app.

## 2) Create the tunnel in Cloudflare dashboard

1. Open Cloudflare dashboard.
2. Go to `Zero Trust` -> `Networks` -> `Tunnels`.
3. Click `Create a tunnel`.
4. Choose `Cloudflared`.
5. Set a name, for example `viajechavales-prod`.
6. In `Setup`, choose `Docker` and copy the generated tunnel token.

## 3) Add a public hostname route

Inside the same tunnel:

1. Add `Public hostname`.
2. Example:
- Subdomain: `trips`
- Domain: `yourdomain.com`
- Service type: `HTTP`
- URL: `gateway:80`
3. Save.

`gateway:80` is correct for this repo because `cloudflared` runs in the same Docker network as nginx gateway.

## 4) Configure local environment

In `ViajeChavales/.env` set:

```env
CLOUDFLARED_TUNNEL_TOKEN=<your_tunnel_token_here>
CLOUDFLARE_PUBLIC_HOSTNAME=trips.yourdomain.com
```

Keep existing app vars (`POSTGRES_*`, `JWT_*`, `APP_PORT`) as they are.

## 5) Start app + tunnel

Start app stack first:

- Linux/macOS:

```bash
./init-app
```

- Windows PowerShell:

```powershell
.\init-app.ps1
```

Then start tunnel connector:

- Linux/macOS:

```bash
bash ./scripts/start-cloudflare-tunnel.sh
```

- Windows PowerShell:

```powershell
.\scripts\start-cloudflare-tunnel.ps1
```

One-shot app + tunnel:

- Linux/macOS:

```bash
bash ./scripts/init-and-deploy.sh
```

- Windows PowerShell:

```powershell
.\scripts\init-and-deploy.ps1
```

Optional live logs:

- Linux/macOS:

```bash
bash ./scripts/start-cloudflare-tunnel.sh --show-logs
```

- Windows PowerShell:

```powershell
.\scripts\start-cloudflare-tunnel.ps1 -ShowLogs
```

## 6) Validate

1. Check connector health in Cloudflare dashboard: tunnel should show `Healthy`.
2. Open your hostname, for example `https://trips.yourdomain.com`.
3. Check app and API:
- UI loads.
- Login works.
- Socket/chat works over `wss`.

## 7) Day-2 operations

- Restart connector only:

```bash
docker compose --env-file .env --profile cloudflare restart cloudflared
```

- See connector logs:

```bash
docker compose --env-file .env --profile cloudflare logs -f cloudflared
```

- Stop connector:

```bash
docker compose --env-file .env --profile cloudflare stop cloudflared
```

## 8) Use on another laptop or home server

Recommended pattern: one tunnel per machine/environment.

Examples:
- `viajechavales-laptop`
- `viajechavales-home-server`

Why:
- Clear ownership and easier debugging.
- No accidental load balancing between two machines on the same tunnel.
- Independent rotation/revocation of tokens.

Migration checklist:

1. Clone repo on target machine.
2. Run `init-app` / `init-app.ps1`.
3. Create a new tunnel in Cloudflare for that machine.
4. Add hostname route to `gateway:80`.
5. Put that tunnel token in target machine `.env`.
6. Run tunnel start script.

## 9) Deploy only one part (without stopping DB)

When you only changed frontend:

- Linux/macOS:

```bash
bash ./scripts/deploy-part.sh frontend
```

- Windows PowerShell:

```powershell
.\scripts\deploy-part.ps1 -Target frontend
```

When you only changed backend:

- Linux/macOS:

```bash
bash ./scripts/deploy-part.sh backend
```

- Windows PowerShell:

```powershell
.\scripts\deploy-part.ps1 -Target backend
```

Important:
- `frontend` deploy does not stop `backend` or `db`.
- `backend` deploy does not stop `db`.
- Tunnel can be redeployed alone with `cloudflared` target.

## 10) Quick tunnel for temporary demos (not production)

If you only need a temporary public URL:

```bash
docker run --rm --network host cloudflare/cloudflared:latest tunnel --url http://localhost:8091
```

Use only for ad-hoc demos/testing. Keep named tunnel + token for stable production URLs.

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

## 3) Add public hostname routes (single shared connector)

The tunnel runs in its own Compose stack (`infra/cloudflare-tunnel/`) on Docker network `devogs_edge`, alongside the ViajeChavales **gateway** container. That gateway is reachable on the shared network under the hostname **`devogs-ingress`**.

Inside the same tunnel, add one route per hostname and point **all** of them to:

- **URL**: `http://devogs-ingress:80` (not `gateway:80` — that DNS name only existed inside the old single-compose stack).

1. Add `Public hostname`.
2. Add Trips route:
- Subdomain: `trips`
- Domain: `yourdomain.com`
- Service type: `HTTP`
- URL: `http://devogs-ingress:80`
3. Add Gael-Games route:
- Subdomain: `gael-games`
- Domain: `yourdomain.com`
- Service type: `HTTP`
- URL: `http://devogs-ingress:80`
4. Add Portfolio route:
- Subdomain: `sergio-elias`
- Domain: `devogs.com`
- Service type: `HTTP`
- URL: `http://devogs-ingress:80`
5. Add default/root route for landing:
- Domain: `yourdomain.com` (no subdomain)
- Service type: `HTTP`
- URL: `http://devogs-ingress:80`
6. Save.

If you still have old routes using `gateway:80`, update them to `devogs-ingress:80` after this split.

## 4) Configure local environment

Put the tunnel token in **`infra/cloudflare-tunnel/.env`** (copy from `infra/cloudflare-tunnel/.env.example`):

```env
CLOUDFLARED_TUNNEL_TOKEN=<your_tunnel_token_here>
```

`scripts/deploy-cloudflare-tunnel.*` reads **that file first**. If it is missing or has no token, they fall back to `CLOUDFLARED_TUNNEL_TOKEN` in `ViajeChavales/.env` (legacy).

Optional helper in `ViajeChavales/.env` so scripts can print a public URL:

```env
CLOUDFLARE_PUBLIC_HOSTNAME=trips.yourdomain.com
```

Keep existing app vars (`POSTGRES_*`, `JWT_*`, `APP_PORT`) as they are.

## 5) Start app + tunnel

Start the ViajeChavales stack first (`./init-app` or `.\init-app.ps1` in this folder).

Then start the **shared** tunnel from the **repo root** (`PWs/`):

- Linux/macOS:

```bash
bash scripts/deploy-cloudflare-tunnel.sh
```

- Windows PowerShell:

```powershell
.\scripts\deploy-cloudflare-tunnel.ps1
```

Wrappers still work under `ViajeChavales/scripts/` (they call the root script).

One-shot **ViajeChavales + tunnel** from this app folder:

- Linux/macOS: `bash ./scripts/init-and-deploy.sh`
- Windows: `.\scripts\init-and-deploy.ps1`

**All apps + tunnel** from repo root: `bash scripts/init-and-deploy-all.sh` or `.\scripts\init-and-deploy-all.ps1`.

Optional live logs after start: `docker logs -f pws-cloudflared`

## 6) Validate

1. Check connector health in Cloudflare dashboard: tunnel should show `Healthy`.
2. Open your hostname, for example `https://trips.yourdomain.com`.
3. Check app and API:
- UI loads.
- Login works.
- Socket/chat works over `wss`.

## 7) Day-2 operations

Connector container name: **`pws-cloudflared`** (stack `infra/cloudflare-tunnel/`).

- Redeploy / restart connector:

```bash
bash scripts/deploy-cloudflare-tunnel.sh
```

(from repo root only; tunnel is not a `deploy-part` target)

- Logs:

```bash
docker logs -f pws-cloudflared
```

- Stop connector:

```bash
docker stop pws-cloudflared
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
4. Add hostname routes to `http://devogs-ingress:80`.
5. Put the tunnel token in `infra/cloudflare-tunnel/.env` (see `infra/cloudflare-tunnel/.env.example`).
6. From repo root, run `bash scripts/deploy-cloudflare-tunnel.sh` (Windows: `.\scripts\deploy-cloudflare-tunnel.ps1`).

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
- Redeploy the tunnel from repo root: `bash scripts/deploy-cloudflare-tunnel.sh`.

## 10) Quick tunnel for temporary demos (not production)

If you only need a temporary public URL:

```bash
docker run --rm --network host cloudflare/cloudflared:latest tunnel --url http://localhost:8091
```

Use only for ad-hoc demos/testing. Keep named tunnel + token for stable production URLs.

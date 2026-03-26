# Gael-Games Cloudflare Tunnel

## Shared tunnel model (default)

Gael-Games uses the same named tunnel connector as the rest of the monorepo.

- Single connector on the host: **`pws-cloudflared`** (`infra/cloudflare-tunnel/` at repo root).
- Gael-Games does **not** run its own `cloudflared` container in normal operation.
- In `Gael-Games/.env`, keep:

```env
CLOUDFLARE_PUBLIC_HOSTNAME=gael-games.devogs.com
```

If you change routes in the Cloudflare dashboard, refresh the connector from **repo root** (`PWs/`):

Windows:

```powershell
cd C:\Users\hijue\OneDrive\Escritorio\PWs
.\scripts\deploy-cloudflare-tunnel.ps1
```

Linux:

```bash
cd /path/to/PWs
bash scripts/deploy-cloudflare-tunnel.sh
```

## Route target in Cloudflare (mandatory)

In **Zero Trust → Networks → Tunnels → [your tunnel] → Public hostname routes**, the **Service URL** for `gael-games.<yourdomain>` must be:

- **`http://devogs-ingress:80`**

Do **not** use:

- `http://gateway:80` — `gateway` is not a stable hostname on the shared Docker network; it can resolve to the wrong container and cause “random” app swaps between subdomains.
- `http://host.docker.internal:...` — that was an old pattern for Linux; the ingress now proxies to app gateways via Docker DNS on `devogs_edge` (see [`infra/ingress/default.conf`](../../infra/ingress/default.conf)).

The **shared ingress** stack joins network `devogs_edge` with alias **`devogs-ingress`**. That is the only origin the tunnel should hit for all apps (Trips, landing, Gael-Games, Portfolio).

## How traffic reaches Gael-Games

1. Browser → Cloudflare → `cloudflared` → `http://devogs-ingress:80` with `Host: gael-games.devogs.com`.
2. Nginx in `viajechavales-gateway` matches `server_name gael-games.devogs.com` and `proxy_pass`es to the Gael-Games gateway container on the same Docker network (e.g. `gael-games-gateway:80`).

Full diagram and troubleshooting: `ViajeChavales/docs/cloudflare-tunnel.md`.

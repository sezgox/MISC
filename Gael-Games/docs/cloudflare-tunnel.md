# Gael-Games Cloudflare Tunnel

## Shared tunnel model (default)

Gael-Games uses the same named tunnel connector as ViajeChavales.

- Single connector container on host: **`pws-cloudflared`** (`infra/cloudflare-tunnel/`)
- Gael-Games does not need its own running `cloudflared` container in normal operation.
- In `Gael-Games/.env`, keep:

```env
CLOUDFLARE_PUBLIC_HOSTNAME=gael-games.devogs.com
```

If you update routes in Cloudflare dashboard, refresh the shared connector from **repo root** (`PWs/`):

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

## Route target

Cloudflare public hostname should point to:
- service: `gateway`
- URL in shared connector network (ViajeChavales): `http://gateway:80`

Note:
- `ViajeChavales/infra/nginx/default.conf` routes `gael-games.devogs.com` to `http://host.docker.internal:8092`.

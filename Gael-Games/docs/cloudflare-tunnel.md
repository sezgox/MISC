# Gael-Games Cloudflare Tunnel

## Shared tunnel model (default)

Gael-Games uses the same named tunnel connector as ViajeChavales.

- Single connector process on host: `ViajeChavales/cloudflared`
- Gael-Games does not need its own running `cloudflared` container in normal operation.
- In `Gael-Games/.env`, keep:

```env
CLOUDFLARE_PUBLIC_HOSTNAME=gael-games.devogs.com
CLOUDFLARED_RUN_LOCAL=false
```

If you update routes in Cloudflare dashboard, refresh the shared connector from ViajeChavales:

Windows:
```powershell
cd ..\ViajeChavales
.\scripts\refresh-cloudflare-tunnel.ps1
```

Linux:
```bash
cd ../ViajeChavales
bash ./scripts/refresh-cloudflare-tunnel.sh
```

## Optional local cloudflared for diagnostics only

Only if you explicitly want a second temporary connector:

```env
CLOUDFLARED_RUN_LOCAL=true
CLOUDFLARED_TUNNEL_TOKEN=<named_tunnel_token>
```

## Route target

Cloudflare public hostname should point to:
- service: `gateway`
- URL in shared connector network (ViajeChavales): `http://gateway:80`

Note:
- `ViajeChavales/infra/nginx/default.conf` routes `gael-games.devogs.com` to `http://host.docker.internal:8092`.

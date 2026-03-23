# Gael-Games Cloudflare Tunnel

## Required variables

In `Gael-Games/.env`:

```env
CLOUDFLARED_TUNNEL_TOKEN=<named_tunnel_token>
CLOUDFLARE_PUBLIC_HOSTNAME=gael-games.devogs.com
```

## Start/refresh tunnel

Windows:
```powershell
.\scripts\start-cloudflare-tunnel.ps1
.\scripts\refresh-cloudflare-tunnel.ps1
```

Linux:
```bash
bash ./scripts/start-cloudflare-tunnel.sh
bash ./scripts/refresh-cloudflare-tunnel.sh
```

Show logs:

Windows:
```powershell
.\scripts\start-cloudflare-tunnel.ps1 -ShowLogs
```

Linux:
```bash
bash ./scripts/start-cloudflare-tunnel.sh --show-logs
```

## Route target

Cloudflare public hostname should point to:
- service: `gateway`
- URL inside compose network: `http://gateway:80`


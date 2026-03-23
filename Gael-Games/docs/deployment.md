# Gael-Games Deployment Runbook

## 1) First boot (local)

Windows:
```powershell
cd C:\Users\hijue\OneDrive\Escritorio\PWs\Gael-Games
.\init-app.ps1
```

Linux:
```bash
cd /path/to/PWs/Gael-Games
bash ./init-app
```

Default local URL:
- `http://127.0.0.1:8092`

## 2) Full boot + publish

Windows:
```powershell
.\scripts\init-and-deploy.ps1
```

Linux:
```bash
bash ./scripts/init-and-deploy.sh
```

This starts:
- static frontend container,
- gateway container,
- no local `cloudflared` in normal mode (shared tunnel connector lives in `ViajeChavales`).

## 3) Partial deploy targets

Windows:
```powershell
.\scripts\deploy-part.ps1 -Target frontend
.\scripts\deploy-part.ps1 -Target gateway
.\scripts\deploy-part.ps1 -Target all
```

Linux:
```bash
bash ./scripts/deploy-part.sh frontend
bash ./scripts/deploy-part.sh gateway
bash ./scripts/deploy-part.sh all
```

Notes:
- `backend` target is accepted but no-op for this app.
- `cloudflared` target is always a no-op in Gael-Games (shared connector only).

## 4) Cloudflare URL

Planned hostname:
- `https://gael-games.devogs.com`

Set in `.env`:
```env
CLOUDFLARE_PUBLIC_HOSTNAME=gael-games.devogs.com
```

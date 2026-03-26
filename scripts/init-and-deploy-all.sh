#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash "$REPO_ROOT/scripts/ensure-devogs-edge-network.sh"

if [[ -f "$REPO_ROOT/ViajeChavales/.env" ]]; then
  echo "=== ViajeChavales ==="
  bash "$REPO_ROOT/ViajeChavales/init-app"
else
  echo "Omitido ViajeChavales: no hay .env"
fi

if [[ -f "$REPO_ROOT/Gael-Games/.env" ]]; then
  echo "=== Gael-Games ==="
  bash "$REPO_ROOT/Gael-Games/init-app"
else
  echo "Omitido Gael-Games: no hay .env"
fi

if [[ -f "$REPO_ROOT/Portfolio/.env" ]]; then
  echo "=== Portfolio ==="
  bash "$REPO_ROOT/Portfolio/init-app"
else
  echo "Omitido Portfolio: no hay .env"
fi

echo "=== Shared ingress (devogs-ingress, landing + proxies) ==="
bash "$REPO_ROOT/infra/ingress/up.sh"

if [[ -f "$REPO_ROOT/infra/cloudflare-tunnel/.env" ]] && grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=.+' "$REPO_ROOT/infra/cloudflare-tunnel/.env"; then
  echo "=== Cloudflare tunnel (token infra/cloudflare-tunnel/.env) ==="
  bash "$REPO_ROOT/scripts/deploy-cloudflare-tunnel.sh"
elif [[ -f "$REPO_ROOT/ViajeChavales/.env" ]] && grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=.+' "$REPO_ROOT/ViajeChavales/.env"; then
  echo "=== Cloudflare tunnel (token ViajeChavales/.env, fallback) ==="
  bash "$REPO_ROOT/scripts/deploy-cloudflare-tunnel.sh"
else
  echo "Omitido tunnel: sin CLOUDFLARED_TUNNEL_TOKEN"
  echo ""
  echo "Listo."
  exit 0
fi

if ! docker ps --filter 'name=pws-cloudflared' --filter 'status=running' --format '{{.Names}}' | grep -q .; then
  echo "ERROR: pws-cloudflared no esta en ejecucion. docker logs pws-cloudflared" >&2
  exit 1
fi
echo "Tunnel OK: pws-cloudflared"

echo ""
echo "Listo. Rutas Cloudflare: http://devogs-ingress:80"

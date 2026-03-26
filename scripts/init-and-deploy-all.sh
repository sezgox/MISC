#!/usr/bin/env bash
# Full stack on the host: shared Docker network, ViajeChavales + Gael-Games + Portfolio (if each has .env),
# shared HTTP ingress (infra/ingress), then Cloudflare tunnel when CLOUDFLARED_TUNNEL_TOKEN is set,
# and finally ensure monitoring (Uptime Kuma) is running.
#
# Greenfield / CI: GitHub job bootstrap-selfhosted writes the four DEPLOY_ENV_* bodies to .env files and runs this script.
# Manual greenfield: place .env files as in scripts/GREENFIELD.md, then: bash scripts/init-and-deploy-all.sh
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

tunnel_deployed=false
if [[ -f "$REPO_ROOT/infra/cloudflare-tunnel/.env" ]] && grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=.+' "$REPO_ROOT/infra/cloudflare-tunnel/.env"; then
  echo "=== Cloudflare tunnel (token infra/cloudflare-tunnel/.env) ==="
  bash "$REPO_ROOT/scripts/deploy-cloudflare-tunnel.sh"
  tunnel_deployed=true
elif [[ -f "$REPO_ROOT/ViajeChavales/.env" ]] && grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=.+' "$REPO_ROOT/ViajeChavales/.env"; then
  echo "=== Cloudflare tunnel (token ViajeChavales/.env, fallback) ==="
  bash "$REPO_ROOT/scripts/deploy-cloudflare-tunnel.sh"
  tunnel_deployed=true
else
  echo "Omitido tunnel: sin CLOUDFLARED_TUNNEL_TOKEN"
fi

if [[ "$tunnel_deployed" == "true" ]]; then
  if ! docker ps --filter 'name=pws-cloudflared' --filter 'status=running' --format '{{.Names}}' | grep -q .; then
    echo "ERROR: pws-cloudflared no esta en ejecucion. docker logs pws-cloudflared" >&2
    exit 1
  fi
  echo "Tunnel OK: pws-cloudflared"
fi

if [[ -f "$REPO_ROOT/infra/monitoring/docker-compose.yml" ]]; then
  if docker ps --filter 'name=pws-uptime-kuma' --filter 'status=running' --format '{{.Names}}' | grep -q .; then
    echo "Monitoring OK: pws-uptime-kuma ya esta en ejecucion"
  else
    echo "=== Monitoring (ensure Uptime Kuma) ==="
    bash "$REPO_ROOT/infra/monitoring/up.sh"
  fi
else
  echo "Omitido monitoring: no existe infra/monitoring/docker-compose.yml"
fi

echo ""
echo "Listo. Rutas Cloudflare: http://devogs-ingress:80"

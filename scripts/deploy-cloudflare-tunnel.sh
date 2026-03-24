#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TUNNEL_DIR="$REPO_ROOT/infra/cloudflare-tunnel"
VIA_ENV="$REPO_ROOT/ViajeChavales/.env"
TUNNEL_ONLY_ENV="$TUNNEL_DIR/.env"
COMPOSE_FILE="$TUNNEL_DIR/docker-compose.yml"

bash "$REPO_ROOT/scripts/ensure-devogs-edge-network.sh"

ENV_FILE=""
if [[ -f "$TUNNEL_ONLY_ENV" ]] && grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=.+' "$TUNNEL_ONLY_ENV"; then
  ENV_FILE="$TUNNEL_ONLY_ENV"
  echo "Using CLOUDFLARED_TUNNEL_TOKEN from infra/cloudflare-tunnel/.env"
elif [[ -f "$VIA_ENV" ]] && grep -qE '^CLOUDFLARED_TUNNEL_TOKEN=.+' "$VIA_ENV"; then
  ENV_FILE="$VIA_ENV"
  echo "Using CLOUDFLARED_TUNNEL_TOKEN from ViajeChavales/.env (fallback; prefer infra/cloudflare-tunnel/.env)"
else
  echo "Missing CLOUDFLARED_TUNNEL_TOKEN: copy infra/cloudflare-tunnel/.env.example to infra/cloudflare-tunnel/.env and set the token" >&2
  exit 1
fi

echo "Starting Cloudflare tunnel (pws-cloudflared) on network devogs_edge..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate

echo ""
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
echo ""
echo "Cloudflare routes must point to http://devogs-ingress:80"

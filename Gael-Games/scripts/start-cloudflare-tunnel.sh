#!/usr/bin/env bash
set -euo pipefail

SHOW_LOGS="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env"

compose() {
  docker compose -f "$APP_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"
}

read_env_value() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -n 1 | cut -d'=' -f2- || true)"
  echo "$value"
}

is_local_cloudflared_enabled() {
  local enabled
  enabled="$(read_env_value CLOUDFLARED_RUN_LOCAL)"
  [[ "${enabled,,}" == "true" ]]
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Run ./init-app first." >&2
  exit 1
fi

TOKEN="$(read_env_value CLOUDFLARED_TUNNEL_TOKEN)"
if ! is_local_cloudflared_enabled; then
  echo "Shared tunnel mode active. Local cloudflared is disabled for Gael-Games."
  echo "No action required here; connector runs under ViajeChavales."
  exit 0
fi
if [[ -z "$TOKEN" ]]; then
  echo "CLOUDFLARED_TUNNEL_TOKEN is empty in .env. Cannot start local cloudflared." >&2
  exit 1
fi

echo "Starting Cloudflare tunnel connector..."
compose --profile cloudflare up -d --no-deps cloudflared
compose --profile cloudflare ps

if [[ "$SHOW_LOGS" == "--show-logs" ]]; then
  compose --profile cloudflare logs -f cloudflared
fi

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
TARGET="${1:-}"

compose() {
  docker compose -f "$APP_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"
}

usage() {
  echo "Usage: bash ./scripts/deploy-part.sh <frontend|backend|gateway|cloudflared|all>"
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

if [[ -z "$TARGET" ]]; then
  usage
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Run ./init-app first." >&2
  exit 1
fi

case "$TARGET" in
  frontend)
    compose up -d --build --no-deps frontend
    ;;
  backend)
    echo "Gael-Games has no backend service. Skipping target 'backend'."
    ;;
  gateway)
    compose up -d --build --no-deps gateway
    ;;
  cloudflared)
    if ! is_local_cloudflared_enabled; then
      echo "Shared tunnel mode active. Skipping local cloudflared for Gael-Games."
      echo "Use ViajeChavales connector as the single tunnel process on this host."
      exit 0
    fi
    if [[ -z "$(read_env_value CLOUDFLARED_TUNNEL_TOKEN)" ]]; then
      echo "CLOUDFLARED_TUNNEL_TOKEN is empty in .env. Cannot deploy cloudflared." >&2
      exit 1
    fi
    compose --profile cloudflare up -d --no-deps cloudflared
    ;;
  all)
    compose up -d --build frontend gateway
    ;;
  *)
    usage
    exit 1
    ;;
esac

echo
echo "Deploy finished for: $TARGET"
compose --profile cloudflare ps

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
SHOW_LOGS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --show-logs)
      SHOW_LOGS=1
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

compose() {
  docker compose -f "$APP_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Run ./init-app first." >&2
  exit 1
fi

require_command docker

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${CLOUDFLARED_TUNNEL_TOKEN:-}" ]]; then
  echo "CLOUDFLARED_TUNNEL_TOKEN is empty in $ENV_FILE." >&2
  echo "Create a tunnel in Cloudflare and paste the token in .env first." >&2
  exit 1
fi

echo "Starting Cloudflare tunnel connector..."
compose --profile cloudflare up -d --no-deps cloudflared

echo
echo "Tunnel connector status:"
compose --profile cloudflare ps cloudflared

if [[ "$SHOW_LOGS" -eq 1 ]]; then
  echo
  echo "Recent logs:"
  compose --profile cloudflare logs --tail 40 cloudflared
else
  echo
  echo "Tip: for logs run:"
  echo "docker compose -f \"$APP_DIR/docker-compose.yml\" --env-file \"$ENV_FILE\" --profile cloudflare logs -f cloudflared"
fi

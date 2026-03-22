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

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Run ./init-app first." >&2
  exit 1
fi

compose --profile cloudflare up -d --no-deps cloudflared
compose --profile cloudflare ps cloudflared

if [[ "$SHOW_LOGS" -eq 1 ]]; then
  compose --profile cloudflare logs --tail 50 cloudflared
fi

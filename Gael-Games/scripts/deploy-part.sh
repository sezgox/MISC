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
    echo "Shared tunnel mode: Gael-Games does not run a local cloudflared service."
    echo "Use ViajeChavales/scripts/deploy-part.* cloudflared for connector updates."
    exit 0
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
compose ps

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
  echo "Usage: bash ./scripts/deploy-part.sh <frontend|backend|gateway|all>"
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
    compose up -d --build --no-deps backend
    ;;
  gateway)
    compose up -d --build --no-deps gateway
    ;;
  all)
    compose up -d --build
    ;;
  *)
    usage
    exit 1
    ;;
esac

echo
echo "Deploy finished for: $TARGET"
compose ps

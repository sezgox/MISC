#!/usr/bin/env bash
# frontend = static Vite image; gateway = nginx in front of it.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
TARGET="${1:-}"

compose() {
  docker compose -f "$APP_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"
}

compose_retry() {
  local attempt=1
  local max_attempts=3
  local delay_seconds=20

  until compose "$@"; do
    local status=$?
    if (( attempt >= max_attempts )); then
      return "$status"
    fi

    echo "docker compose failed with exit code $status; retrying in ${delay_seconds}s ($attempt/$max_attempts)..." >&2
    sleep "$delay_seconds"
    attempt=$((attempt + 1))
    delay_seconds=$((delay_seconds * 2))
  done
}

usage() {
  echo "Usage: bash ./scripts/deploy-part.sh <frontend|gateway|all>"
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
    compose_retry up -d --build --no-deps frontend
    ;;
  gateway)
    compose_retry up -d --build --no-deps gateway
    ;;
  all)
    compose_retry up -d --build frontend gateway
    ;;
  *)
    usage
    exit 1
    ;;
esac

echo
echo "Deploy finished for: $TARGET"
compose ps

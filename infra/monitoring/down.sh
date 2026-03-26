#!/usr/bin/env bash
# Stop monitoring stack (Uptime Kuma).
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/.env"
ARGS=(-f "$DIR/docker-compose.yml")

if [[ -f "$ENV_FILE" ]]; then
  ARGS+=(--env-file "$ENV_FILE")
fi

docker compose "${ARGS[@]}" down

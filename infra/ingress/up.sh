#!/usr/bin/env bash
# Start or recreate shared ingress (devogs-ingress on devogs_edge).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/../.." && pwd)"
bash "$REPO_ROOT/scripts/ensure-devogs-edge-network.sh"
ENV_FILE="$DIR/.env"
ARGS=(-f "$DIR/docker-compose.yml")
if [[ -f "$ENV_FILE" ]]; then
  ARGS+=(--env-file "$ENV_FILE")
fi
docker compose "${ARGS[@]}" up -d --force-recreate

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$APP_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env"
ACTION="${1:-}"
TARGET="${2:-}"

compose() {
  docker compose -f "$APP_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"
}

usage() {
  cat <<'EOF'
Usage:
  bash ./scripts/ops.sh status
  bash ./scripts/ops.sh logs <service>
  bash ./scripts/ops.sh restart <service>
  bash ./scripts/ops.sh ps

Examples:
  bash ./scripts/ops.sh logs backend
  bash ./scripts/ops.sh restart gateway
  bash ./scripts/ops.sh logs cloudflared   # contenedor pws-cloudflared (repo raíz)
EOF
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

case "$ACTION" in
  status|ps)
    compose ps
    echo ""
    docker ps -a --filter name=pws-cloudflared --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' 2>/dev/null || true
    ;;
  logs)
    if [[ -z "$TARGET" ]]; then
      echo "Missing service name for logs" >&2
      usage
      exit 1
    fi
    if [[ "$TARGET" == "cloudflared" ]]; then
      docker logs --tail 80 pws-cloudflared
    else
      compose logs --tail 80 "$TARGET"
    fi
    ;;
  restart)
    if [[ -z "$TARGET" ]]; then
      echo "Missing service name for restart" >&2
      usage
      exit 1
    fi
    if [[ "$TARGET" == "cloudflared" ]]; then
      bash "$REPO_ROOT/scripts/deploy-cloudflare-tunnel.sh"
    else
      compose restart "$TARGET"
      compose ps "$TARGET"
    fi
    ;;
  *)
    usage
    exit 1
    ;;
esac

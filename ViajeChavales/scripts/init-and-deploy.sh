#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$APP_DIR/.." && pwd)"
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

echo "Step 1/2: starting app stack..."
bash "$APP_DIR/init-app"

echo
echo "Step 2/2: Cloudflare tunnel (repo root)..."
bash "$REPO_ROOT/scripts/deploy-cloudflare-tunnel.sh"

if [[ "$SHOW_LOGS" -eq 1 ]]; then
  echo
  echo "Recent tunnel logs:"
  docker logs --tail 40 pws-cloudflared 2>/dev/null || true
fi

if [[ -f "$ENV_FILE" ]]; then
  PUBLIC_HOSTNAME="$(grep '^CLOUDFLARE_PUBLIC_HOSTNAME=' "$ENV_FILE" | cut -d'=' -f2- || true)"
  if [[ -n "$PUBLIC_HOSTNAME" ]]; then
    echo
    echo "Public URL: https://$PUBLIC_HOSTNAME"
  fi
fi

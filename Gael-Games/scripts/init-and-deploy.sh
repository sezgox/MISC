#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$APP_DIR/.env"

read_env_value() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -n 1 | cut -d'=' -f2- || true)"
  echo "$value"
}

cd "$APP_DIR"
bash ./init-app

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE after init-app." >&2
  exit 1
fi

bash ./scripts/start-cloudflare-tunnel.sh

PUBLIC_HOSTNAME="$(read_env_value CLOUDFLARE_PUBLIC_HOSTNAME)"
if [[ -n "$PUBLIC_HOSTNAME" ]]; then
  echo "Public URL: https://$PUBLIC_HOSTNAME"
fi

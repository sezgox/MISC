#!/usr/bin/env bash
# Baja stacks PWs: tunel compartido (solo infra/cloudflare-tunnel → pws-cloudflared), ingress, apps, red devogs_edge.
# No elimina otros conectores cloudflared del mismo host (otros repos / tuneles dedicados).
# Uso:
#   bash scripts/teardown-pws-docker.sh [--rmi]
#   bash scripts/teardown-pws-docker.sh --allow-db-volume-removal [--rmi]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RMI=()
REMOVE_VOLUMES=()
ALLOW_DB_VOLUME_REMOVAL=false
for arg in "$@"; do
  case "$arg" in
    --rmi)
      RMI=(--rmi local)
      ;;
    --allow-db-volume-removal)
      ALLOW_DB_VOLUME_REMOVAL=true
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ "$ALLOW_DB_VOLUME_REMOVAL" == "true" ]]; then
  echo "WARNING: removing named volumes (including DB volumes)."
  REMOVE_VOLUMES=(-v)
fi

TC="$REPO_ROOT/infra/cloudflare-tunnel/docker-compose.yml"
if [[ -f "$REPO_ROOT/infra/cloudflare-tunnel/.env" ]]; then
  docker compose -f "$TC" --env-file "$REPO_ROOT/infra/cloudflare-tunnel/.env" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
elif [[ -f "$REPO_ROOT/ViajeChavales/.env" ]]; then
  docker compose -f "$TC" --env-file "$REPO_ROOT/ViajeChavales/.env" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
elif [[ -f "$TC" ]]; then
  docker compose -f "$TC" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
fi
docker rm -f pws-cloudflared 2>/dev/null || true

IC="$REPO_ROOT/infra/ingress/docker-compose.yml"
IE="$REPO_ROOT/infra/ingress/.env"
if [[ -f "$IC" ]]; then
  echo "Down infra/ingress..."
  if [[ -f "$IE" ]]; then
    docker compose -f "$IC" --env-file "$IE" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
  else
    docker compose -f "$IC" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
  fi
fi

for app in Portfolio Gael-Games ViajeChavales; do
  CF="$REPO_ROOT/$app/docker-compose.yml"
  EF="$REPO_ROOT/$app/.env"
  [[ -f "$CF" ]] || continue
  echo "Down $app..."
  if [[ -f "$EF" ]]; then
    docker compose -f "$CF" --env-file "$EF" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
  else
    docker compose -f "$CF" down --remove-orphans "${REMOVE_VOLUMES[@]}" "${RMI[@]}" || true
  fi
done

docker network rm devogs_edge 2>/dev/null || true
echo "Teardown finished."

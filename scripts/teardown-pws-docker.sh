#!/usr/bin/env bash
# Baja stacks PWs, tunel y red devogs_edge. Uso: bash scripts/teardown-pws-docker.sh [--rmi]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RMI=()
if [[ "${1:-}" == "--rmi" ]]; then
  RMI=(--rmi local)
fi

TC="$REPO_ROOT/infra/cloudflare-tunnel/docker-compose.yml"
if [[ -f "$REPO_ROOT/infra/cloudflare-tunnel/.env" ]]; then
  docker compose -f "$TC" --env-file "$REPO_ROOT/infra/cloudflare-tunnel/.env" down --remove-orphans "${RMI[@]}" || true
elif [[ -f "$REPO_ROOT/ViajeChavales/.env" ]]; then
  docker compose -f "$TC" --env-file "$REPO_ROOT/ViajeChavales/.env" down --remove-orphans "${RMI[@]}" || true
elif [[ -f "$TC" ]]; then
  docker compose -f "$TC" down --remove-orphans "${RMI[@]}" || true
fi
docker rm -f pws-cloudflared 2>/dev/null || true
ids="$(docker ps -aq --filter 'name=cloudflared' 2>/dev/null || true)"
if [[ -n "${ids// }" ]]; then docker rm -f $ids || true; fi

IC="$REPO_ROOT/infra/ingress/docker-compose.yml"
IE="$REPO_ROOT/infra/ingress/.env"
if [[ -f "$IC" ]]; then
  echo "Down infra/ingress..."
  if [[ -f "$IE" ]]; then
    docker compose -f "$IC" --env-file "$IE" down --remove-orphans "${RMI[@]}" || true
  else
    docker compose -f "$IC" down --remove-orphans "${RMI[@]}" || true
  fi
fi

for app in Portfolio Gael-Games ViajeChavales; do
  CF="$REPO_ROOT/$app/docker-compose.yml"
  EF="$REPO_ROOT/$app/.env"
  [[ -f "$CF" ]] || continue
  echo "Down $app..."
  if [[ -f "$EF" ]]; then
    docker compose -f "$CF" --env-file "$EF" down --remove-orphans "${RMI[@]}" || true
  else
    docker compose -f "$CF" down --remove-orphans "${RMI[@]}" || true
  fi
done

docker network rm devogs_edge 2>/dev/null || true
echo "Teardown finished."

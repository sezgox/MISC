#!/usr/bin/env bash
set -euo pipefail
if docker network inspect devogs_edge >/dev/null 2>&1; then
  echo "Network devogs_edge already exists."
else
  docker network create devogs_edge
  echo "Created Docker network devogs_edge."
fi

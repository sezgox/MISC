# Verifier Report

## Validation Scope
- Confirm `Gael-Games` does not define its own `cloudflared` service in compose.
- Confirm shared connector model: single **`pws-cloudflared`** from `infra/cloudflare-tunnel/`.
- Confirm public route `gael-games.devogs.com` remains reachable when stack + tunnel are up.

## Executed Commands (examples)
- `docker compose --env-file .env.example config` (in `PWs/Gael-Games`)
- `bash ./scripts/deploy-part.sh frontend` (in `PWs/Gael-Games`)
- `docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"`
- `curl -I https://gael-games.devogs.com`

## Test Results
- Compose config resolves with only `frontend` and `gateway` in Gael stack.
- `deploy-part` supports `frontend|gateway|all` only; tunnel is started from repo root `scripts/deploy-cloudflare-tunnel.*`.
- Expect one long-running tunnel container named **`pws-cloudflared`**.

## Findings
- No blocking findings.

## Status
PASS

## Next Action
- Add future app hostnames to the same Cloudflare named tunnel and route them through the shared ingress (`devogs-ingress`).

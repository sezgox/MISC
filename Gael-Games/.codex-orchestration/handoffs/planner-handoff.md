# Planner Handoff

## Objective
- Enforce a strict single-connector Cloudflare model in `PWs`:
  - only **`pws-cloudflared`** (`infra/cloudflare-tunnel/`) stays active,
  - `Gael-Games` never runs its own `cloudflared`,
  - routing remains valid for `gael-games.devogs.com`.

## System Map
- Shared connector owner: `PWs/infra/cloudflare-tunnel/docker-compose.yml` (container `pws-cloudflared`).
- Start/restart: `PWs/scripts/deploy-cloudflare-tunnel.sh` / `.ps1`.
- Gael app stack: `PWs/Gael-Games/docker-compose.yml` + `scripts/deploy-part.*`, `scripts/init-and-deploy.*` (tunnel step calls repo-root script).
- Route bridge:
  - Cloudflare public hostname -> shared ingress (`devogs-ingress:80` on `devogs_edge`),
  - `ViajeChavales/infra/nginx/default.conf` -> proxy to `host.docker.internal:8092`.
- Documentation entry points:
  - `PWs/Gael-Games/docs/cloudflare-tunnel.md`
  - `PWs/Gael-Games/docs/deployment.md`
  - `PWs/ViajeChavales/docs/cloudflare-tunnel.md`

## Change Plan (historical / completed direction)
1. Remove local connector from `Gael-Games/docker-compose.yml`.
2. Remove per-app tunnel wrapper scripts; use repo-root `deploy-cloudflare-tunnel.*` only.
3. Keep `deploy-part` limited to compose services (`frontend|gateway|all` for Gael).
4. Update docs to state tunnel ownership in `infra/cloudflare-tunnel/`.

## Test Plan
- `docker compose --env-file .env.example config` in `PWs/Gael-Games` (no `cloudflared` service).
- `bash scripts/deploy-cloudflare-tunnel.sh` from `PWs/` (starts `pws-cloudflared`).
- `docker ps` shows a single `pws-cloudflared` for this host plan.
- `curl -I https://gael-games.devogs.com` when tunnel + stacks are running.

## Acceptance Criteria
- `Gael-Games` compose does not define `cloudflared`.
- No second connector is started from Gael scripts.
- Documentation points to `infra/cloudflare-tunnel/` and repo-root tunnel scripts.

## Risks & Mitigations
- Risk: stale second connector from past deployments → `docker ps` / `docker rm -f` old containers.
- Risk: token only in app `.env` → prefer `infra/cloudflare-tunnel/.env` per `deploy-cloudflare-tunnel` implementation.

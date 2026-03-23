# Coder Notes

## Implemented Changes
- Enforced strict shared-tunnel behavior in `Gael-Games`:
  - removed `cloudflared` service from `docker-compose.yml`,
  - removed `CLOUDFLARED_TUNNEL_TOKEN` and `CLOUDFLARED_RUN_LOCAL` from `.env.example`,
  - converted local cloudflare scripts into explicit no-op wrappers that point to `ViajeChavales` scripts.
- Updated deploy contract behavior:
  - `scripts/deploy-part.*` keeps `cloudflared` target for compatibility but it now always no-ops.
  - `compose ps` calls no longer use `--profile cloudflare` in Gael scripts.
- Updated docs for strict single connector model:
  - `Gael-Games/docs/cloudflare-tunnel.md`
  - `Gael-Games/docs/deployment.md`
  - `ViajeChavales/docs/cloudflare-tunnel.md` (added `gael-games` hostname route under same tunnel).
- Refreshed orchestration handoff docs for this task in `Gael-Games/.codex-orchestration/handoffs`.

## Out-of-Scope Decisions
- Did not modify unrelated pending changes in `Portfolio`, `VIbing`, or `ViajeChavales` frontend sources.
- Did not alter Cloudflare dashboard entries directly; only repo-side config/docs/scripts were adjusted.

## Deviations From Planner
- None.

## Open Risks
- If Cloudflare dashboard hostnames are changed manually and connector is not refreshed from Viaje, routes can look stale temporarily.

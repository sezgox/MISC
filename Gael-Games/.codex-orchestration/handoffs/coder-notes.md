# Coder Notes

## Implemented Changes
- Enforced shared-tunnel behavior in `Gael-Games`:
  - no `cloudflared` service in `docker-compose.yml`,
  - tunnel is started from repo root `scripts/deploy-cloudflare-tunnel.*` (`init-and-deploy` calls that path),
  - per-app `start-cloudflare-tunnel.*` / `refresh-cloudflare-tunnel.*` wrappers removed in favor of the single infra stack.
- `scripts/deploy-part.*` targets: `frontend|gateway|all` only (compose-aligned).
- Docs updated: `Gael-Games/docs/cloudflare-tunnel.md`, `Gael-Games/docs/deployment.md`, global playbooks/registry as needed.

## Out-of-Scope Decisions
- Did not modify unrelated pending changes in `Portfolio`, `VIbing`, or `ViajeChavales` frontend sources.
- Did not alter Cloudflare dashboard entries directly; only repo-side config/docs/scripts were adjusted.

## Deviations From Planner
- Tunnel ownership documented as `infra/cloudflare-tunnel/` + `pws-cloudflared`, not a service inside `ViajeChavales` compose.

## Open Risks
- If Cloudflare dashboard hostnames change and `pws-cloudflared` is not restarted, routes can look stale until `scripts/deploy-cloudflare-tunnel.*` is run again.

# Planner Handoff

## Objective
- Enforce a strict single-connector Cloudflare model in `PWs`:
  - only `ViajeChavales/cloudflared` stays active,
  - `Gael-Games` never runs its own `cloudflared`,
  - routing remains valid for `gael-games.devogs.com`.

## System Map
- Shared connector owner: `PWs/ViajeChavales/docker-compose.yml` (`cloudflared` service).
- Gael app stack: `PWs/Gael-Games/docker-compose.yml` + `scripts/*cloudflare*`.
- Route bridge:
  - Cloudflare public hostname -> `ViajeChavales` gateway (`gateway:80` inside tunnel network),
  - `ViajeChavales/infra/nginx/default.conf` -> proxy to `host.docker.internal:8092`.
- Documentation entry points:
  - `PWs/Gael-Games/docs/cloudflare-tunnel.md`
  - `PWs/Gael-Games/docs/deployment.md`
  - `PWs/ViajeChavales/docs/cloudflare-tunnel.md`

## Change Plan
1. Remove local connector capability from `Gael-Games/docker-compose.yml`.
2. Remove local connector env knobs from `Gael-Games/.env.example`.
3. Convert Gael cloudflare scripts into explicit shared-mode no-op:
   - `scripts/start-cloudflare-tunnel.*`
   - `scripts/refresh-cloudflare-tunnel.*`
   - `scripts/deploy-part.*` target `cloudflared`.
4. Update Gael docs to state shared connector is mandatory.
5. Update Viaje cloudflare doc to include `gael-games` hostname route under same tunnel.
6. Verify compose/scripts/runtime to confirm one connector behavior.

## Test Plan
- `docker compose --env-file .env.example config` in `PWs/Gael-Games` (must resolve without `cloudflared` service).
- `bash ./scripts/deploy-part.sh cloudflared` (must no-op with shared-mode message).
- `powershell ./scripts/deploy-part.ps1 -Target cloudflared` (same no-op behavior).
- `docker ps --format "table {{.Names}}\t{{.Image}}"` and check there is only one long-running `cloudflared` container for this host plan.
- `curl -I https://gael-games.devogs.com` (public route still reachable).

## Acceptance Criteria
- `Gael-Games` compose no longer defines a `cloudflared` service.
- Gael cloudflare scripts cannot start a second connector.
- Documentation clearly states tunnel ownership in `ViajeChavales`.
- Public route for `gael-games.devogs.com` remains up.

## Risks & Mitigations
- Risk: stale second connector still running from past deployments.
  - Mitigation: remove old Gael connector container and verify with `docker ps`.
- Risk: Cloudflare dashboard route not aligned with shared gateway model.
  - Mitigation: document hostname target and provide connector refresh command from Viaje.

## Execution Order
1. Apply Gael stack/script/doc changes.
2. Apply Viaje Cloudflare doc alignment.
3. Run compose/script/runtime/public checks.
4. Commit only scoped files and push.

## Done Definition
- Host can operate with a single cloudflared connector (`ViajeChavales`) for Gael + Viaje routes.
- Gael deployment scripts remain contract-compatible while preventing duplicate connector starts.
- Changes are committed and pushed.

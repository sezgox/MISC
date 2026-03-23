# Coder Notes

## Implemented Changes
- Integrated app into `PWs/Gael-Games`.
- Added static publish stack:
  - `docker-compose.yml`
  - `Dockerfile.frontend`
  - `infra/nginx/frontend.conf`
  - `infra/nginx/gateway.conf`
- Added mandatory deploy contract scripts:
  - `init-app`, `init-app.ps1`
  - `scripts/deploy-part.sh`, `scripts/deploy-part.ps1`
  - `scripts/init-and-deploy.sh`, `scripts/init-and-deploy.ps1`
  - `scripts/start-cloudflare-tunnel.sh`, `scripts/start-cloudflare-tunnel.ps1`
  - `scripts/refresh-cloudflare-tunnel.sh`, `scripts/refresh-cloudflare-tunnel.ps1`
- Added publish docs and env baseline:
  - `.env.example`, `.gitignore`, `.dockerignore`
  - `docs/deployment.md`, `docs/cloudflare-tunnel.md`
- Updated root CI workflow to include Gael-Games change detection and deploy job.
- Updated active apps registry entry to Gael-Games active/ready with `gael-games.devogs.com`.
- Updated `package.json` scripts to call Vite via node path for robust build execution in this environment.

## Out-of-Scope Decisions
- Did not force-delete/rename the original source folder outside `PWs` because it was locked by another process.
- Did not start real tunnel publishing in this step (requires final token in `.env`).

## Deviations From Planner
- Source folder removal became a non-blocking post-step due filesystem lock; onboarding in `PWs` is complete.

## Open Risks
- Duplicate external source folder still exists and may cause confusion if edited by mistake.

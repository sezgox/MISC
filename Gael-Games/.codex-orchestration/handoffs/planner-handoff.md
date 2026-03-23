# Planner Handoff

## Objective
- Integrate `Gael-Games` into `PWs` and make it publishable via the same self-hosted pipeline as the other apps.
- Prepare Cloudflare publication path for `gael-games.devogs.com`.

## System Map
- App target folder: `PWs/Gael-Games/`
- Root workflow: `PWs/.github/workflows/deploy-selfhosted.yml`
- Registry/playbook docs:
  - `PWs/docs/apps-active-registry.md`
  - `PWs/docs/hosting-playbook.md`
- Deploy scripts contract from playbook:
  - `init-app*`, `scripts/deploy-part*`, `scripts/init-and-deploy*`, tunnel scripts.

## Change Plan
1. Copy app into `PWs/Gael-Games` (without generated folders).
2. Add Docker + gateway + cloudflared compose setup.
3. Implement full script contract (`sh` + `ps1`).
4. Update root CI workflow filters/deploy job.
5. Update active apps registry with final route/port/status.
6. Validate build and compose configuration.
7. Commit and push.

## Test Plan
- `npm run build` in `PWs/Gael-Games`
- `docker compose --env-file .env.example config`
- `docker compose --env-file .env.example --profile cloudflare config`
- `git status` and targeted diff review in `PWs`

## Acceptance Criteria
- `Gael-Games` is under `PWs/` and has mandatory deploy contract.
- Workflow supports partial deploy for Gael-Games.
- Registry entry is updated as active/ready.
- Build and compose config checks pass.
- Commit + push executed.

## Risks & Mitigations
- Risk: duplicate folder left outside `PWs`.
  - Mitigation: mark source as legacy and run from in-repo folder only.
- Risk: tunnel deployment without token.
  - Mitigation: scripts validate `CLOUDFLARED_TUNNEL_TOKEN` before cloudflared start.

## Execution Order
1. App move/copy into `PWs`.
2. Deploy stack/scripts creation.
3. Workflow/docs updates.
4. Validation.
5. Commit/push.

## Done Definition
- Publish-ready onboarding files are in `PWs/Gael-Games`.
- CI workflow includes Gael-Games deploy logic.
- Changes committed and push attempted.

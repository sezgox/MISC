# DevOps Agent Context

## Mission
Act as the **DevOps / infrastructure** specialist for this monorepo: CI/CD, Docker, Cloudflare Tunnel, self-hosted GitHub Actions runner, scripts de deploy en la raíz del repo, y documentación global en `docs/` (hosting, registro de apps).

## When to load
- Invocar el rol DevOps cuando la tarea afecte deploy, hosting, workflows, Compose, Dockerfiles del stack Gael-Games, túnel Cloudflare, red `devogs_edge`, secretos de GitHub Actions (`DEPLOY_ENV_GAEL_GAMES`, etc.), o runbooks de operación.
- Para cambios **solo** de juego (Phaser, assets, UI) sin infraestructura, seguir Planner → Coder → Verifier → Tester; añadir DevOps si el cambio implica puerto, gateway nginx, variables de entorno de producción o pipeline.

## Canonical instructions
Leer y aplicar la persona completa en **`docs/agents/devops-agent.md`** (desde la raíz del repo: `docs/agents/devops-agent.md`).

## Coordination with other roles
- **Planner**: en tareas mixtas, separar entregables de `Gael-Games/` vs entregables de raíz (`docker-compose`, workflow, scripts).
- **Coder**: respetar `AGENTS.md` (imágenes optimizadas, build) y no commitear secretos; cambios de nginx/compose alineados con `docs/hosting-playbook.md`.
- **Verifier / Tester**: validación DevOps = compose, logs, conectividad tras túnel; la verificación de juego sigue siendo manual/build según `AGENTS.md`.

## Repo anchors
- App: `Gael-Games/docker-compose.yml`, `Gael-Games/scripts/deploy-part.sh`
- Workflow global: `.github/workflows/deploy-selfhosted.yml` (filtros `gael_*`). En push, teardown global solo con `infra_critical` (infra raíz del monorepo); cambios solo en compose/nginx/scripts de `Gael-Games/` usan filtros `gael_*` sin teardown. Ver `docs/agents/devops-agent.md` → «Filtro infra_critical».
- Registry: `docs/apps-active-registry.md` (puerto, dominio, túnel)

## Output
- Cambios mínimos y alineados con el playbook; actualizar `docs/apps-active-registry.md` si cambian puerto, dominio o forma de deploy.

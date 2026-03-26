# PWs Global Docs

- `agents/devops-agent.md`: persona y reglas del **agente DevOps** para este monorepo (CI/CD, Docker, túnel, runner); usar con `.codex-orchestration/agents/devops-context.md` en ViajeChavales y Gael-Games.
- `server-bootstrap.md`: checklist para **nuevo servidor / nuevo runner** (Docker, secretos, `workflow_dispatch` con `full_stack_deploy`).
- `hosting-playbook.md`: global standard to dockerize, bootstrap, publish, and partially redeploy apps (includes Cloudflare `devogs-ingress` routing and teardown).
- `apps-active-registry.md`: live registry of active apps, host ports, domains, and deploy entrypoints.
- `logging-runbook.md`: log handling, retention policy, and per-app log commands for laptop/VPS hosting.
- `roadmap-global-pws.md`: global roadmap for cross-app hosting, CI/CD, and ops initiatives.

**Cloudflare Tunnel (shared ingress):** `ViajeChavales/docs/cloudflare-tunnel.md` — route all public hostnames to `http://devogs-ingress:80`; troubleshooting for wrong subdomain / WebSocket issues is in section 6.1.

Keep these files updated whenever a new app gets `init-app`/deploy scripts or changes hosting config.
When a project has parallel AI-agent instructions (`AGENTS.md`, `.cursor/`, `.codex-orchestration/`, workflow docs), update the equivalent guidance together and document any intentional asymmetry.

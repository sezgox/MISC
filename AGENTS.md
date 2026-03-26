# MISC — agentes (monorepo)

Punto de entrada para roles de IA en este repositorio.

| Rol | Documento |
|-----|-----------|
| **DevOps** (infra, CI/CD, Docker, túnel, deploy) | [docs/agents/devops-agent.md](docs/agents/devops-agent.md) |
| **Código** (cambios pequeños en apps, estilos, bugs rápidos) | [docs/agents/code-ops-agent.md](docs/agents/code-ops-agent.md) |

## Regla global de sincronización

- Si un proyecto mantiene instrucciones paralelas para distintas IA o CLIs (por ejemplo Cursor, Codex u otras), esos documentos deben revisarse y actualizarse juntos en la misma tarea.
- Si el cambio afecta solo a una variante, el diff debe dejar explícito por qué la otra no necesita actualización.
- Esta regla aplica tanto a `AGENTS.md` por app como a `.cursor/`, `.codex-orchestration/`, runbooks o documentos de workflow equivalentes.

Por aplicación, ver también `AGENTS.md` en **ViajeChavales** y **Gael-Games**.

**Agentes en servidor (SSH):** [docs/server-ai-agents-plan.md](docs/server-ai-agents-plan.md) y guía operativa [docs/server-ai-agents-execution.md](docs/server-ai-agents-execution.md).

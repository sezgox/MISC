# Cursor + Codex Workflow

This repository is prepared so Cursor can follow the same Codex orchestration style.

## What was configured

- Persistent rules in `.cursor/rules/`:
  - `00-orquestacion-viajechavales.mdc`
  - `10-fullstack-contratos.mdc`
  - `20-verificacion-y-docs.mdc`
- Workspace settings in `.vscode/settings.json` for consistent save/format behavior.

## Mandatory context for agent work

Before multi-file work, review:

- `AGENTS.md`
- `.codex-orchestration/project-context.md`
- `.codex-orchestration/agents/e2e-trigger-matrix.md`
- For infrastructure / deploy / CI/CD tasks: `docs/agents/devops-agent.md` and `.codex-orchestration/agents/devops-context.md`

## Expected role flow

1. Planner writes `.codex-orchestration/handoffs/planner-handoff.md`
2. Coder implements and updates `.codex-orchestration/handoffs/coder-notes.md`
3. Verifier validates and reports in `.codex-orchestration/handoffs/verifier-report.md`
4. Tester runs browser/integration checks when needed in `.codex-orchestration/handoffs/tester-report.md`
5. **DevOps** (optional): when the task touches hosting, workflows, Docker, tunnel, or server operations — follow `docs/agents/devops-agent.md` and `.codex-orchestration/agents/devops-context.md`; may run in parallel with verification or as the primary role for ops-only tasks.

## Verification baseline

- Prefer dev-time checks and targeted tests over full production builds.
- Run flow-specific E2E checks when file triggers match the matrix.
- Keep docs updated when behavior, setup, or deployment steps change.

## Next planned work

- Prioritized roadmap: `docs/roadmap-prioridades.md`

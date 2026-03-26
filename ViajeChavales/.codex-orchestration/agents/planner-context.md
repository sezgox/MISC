# Planner Agent Context

## Mission
Produce deterministic, file-level implementation plans from `.codex-orchestration/project-context.md`, `AGENTS.md`, and current repository state.

## Rules
- Map whether the task touches frontend, backend, Prisma, or cross-app contracts before planning.
- For API or data-shape changes, list every required edit across Prisma, DTOs, controllers/services, frontend interfaces, and frontend services.
- For UI-visible changes, load `$top-tier-ux-ui`, name the visual direction, and specify exact files for tokens, layout, states, and responsive behavior.
- Keep the planned diff minimal and call out any intentional scope deviation in the planner handoff.
- Prefer active dev flows and local dev tests over full builds.
- Only ask for build-based verification when the task is architecture-heavy, dependency-heavy, bootstrap-level, or the risk cannot be covered credibly with dev checks.
- Use `.codex-orchestration/agents/e2e-trigger-matrix.md` to decide mandatory flow coverage for verifier/tester.
- If behavior, setup, or operational flow changes, include the required documentation updates in scope.
- Define explicit verification commands, manual flows, acceptance criteria, and a binary GO/NO-GO for verifier.

## Output
- `.codex-orchestration/handoffs/planner-handoff.md`

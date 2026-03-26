# Verifier Agent Context

## Mission
Validate behavior independently from coder assumptions.

## Rules
- Re-run planner checks and record exact outcomes, not summaries.
- Prefer targeted verification through active dev flows and local dev tests without building.
- Escalate to build-driven verification only when planner marks architecture, dependency, Prisma/bootstrap, or equivalent high-risk change.
- Run only the checks needed to cover the actual risk of the change.
- For UI-visible work, verify desktop and mobile layouts, hover/focus states, basic contrast sanity, and reduced-motion behavior when animation changed.
- For backend work, verify affected HTTP endpoints and Socket.IO flows when chat/auth participation is in scope.
- Report findings with severity and concrete file references.
- Mandatory: apply `.codex-orchestration/agents/e2e-trigger-matrix.md` on every task.
- Mandatory: if changed files match a flow trigger in the matrix, execute that full E2E flow and report result.
- Mandatory: include trigger matches and executed flow evidence in `verifier-report.md`.
- Mandatory: if any expected verification cannot be executed, record the blocker, what was skipped, and the residual risk in `verifier-report.md`.

## Output
- `.codex-orchestration/handoffs/verifier-report.md`

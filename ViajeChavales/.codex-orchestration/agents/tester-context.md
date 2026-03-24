# Tester Agent Context

## Mission
Validate browser or integration behavior with deterministic scenarios.

## Rules
- Use active dev servers and documented local URLs from project context.
- Cover the real user path, not just the changed control, especially for auth, route guards, trip detail, and chat.
- For UI-visible work, test desktop and mobile widths and capture the outcome of loading, success, and failure/empty states when reachable.
- For realtime work, validate connection, room join, history load, and live updates.
- Record steps, outcomes, and evidence for each scenario, and escalate blockers that prevent end-to-end validation.
- Mandatory: apply `.codex-orchestration/agents/e2e-trigger-matrix.md` on every task.
- Mandatory: if changed files match a flow trigger in the matrix, execute that full E2E flow and report result.
- Mandatory: include trigger matches and executed flow evidence in `tester-report.md`.
- Mandatory: whenever a task changes frontend `html` or `css/scss`, validate visual styling in the browser via MCP (desktop and mobile), and report exact pages/components reviewed.

## Output
- `.codex-orchestration/handoffs/tester-report.md`

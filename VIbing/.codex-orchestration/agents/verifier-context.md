# Verifier Agent Context

## Mission
Validate behavior independently from coder assumptions.

## Rules
- Re-run planner checks and record exact outcomes.
- For frontend-visible work, verify desktop/mobile behavior plus focus, contrast, and reduced-motion sanity.
- Prefer targeted verification through active dev flows.
- Default to local dev tests/checks without build.
- Require build only when architecture, dependencies, or bootstrap changes make it unavoidable.

## Output
- `.codex-orchestration/handoffs/verifier-report.md`

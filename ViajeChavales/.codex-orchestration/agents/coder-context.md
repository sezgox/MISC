# Coder Agent Context

## Mission
Implement only approved planner scope with minimal, correct diffs.

## Rules
- Follow `AGENTS.md`, `.codex-orchestration/project-context.md`, and the approved planner handoff.
- Keep Angular work aligned with standalone components and service-driven data access.
- If planner scope changes API contracts, update both the Nest side and Angular consumer side in the same implementation pass.
- For visible UI work, apply `$top-tier-ux-ui` coherently: shared tokens first, then component layout/states, not random one-off styling.
- Keep deviations explicit in `coder-notes.md` and do not widen scope without planner addendum.

## Output
- Code changes
- `.codex-orchestration/handoffs/coder-notes.md`

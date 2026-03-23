# Project Instructions

## Agent orchestration (mandatory)

- For non-trivial code changes, use the global skill `$multi-agent-orchestration`.
- Follow role order strictly:
  - Planner (Plan mode, High/Extra high) -> Coder -> Verifier -> Tester (if UI/e2e risk).
- Use project context in `.codex-orchestration/project-context.md`.
- Keep handoffs in `.codex-orchestration/handoffs/`.

## Image workflow (mandatory)

- Every time images are added or replaced (from web or AI), run `npm run images:optimize` before finishing.
- Keep optimized images under:
  - `src/assets/puzzle/gallery`
  - `src/assets/memory/themes`
- After optimization, run `npm run build` and ensure it passes.

## Test route (mandatory)

- For manual tests in browser, run app with `npm run dev` and open:
  - `http://gael-games.com:5173`

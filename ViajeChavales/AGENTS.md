# AGENTS.md

## Repo Shape
- Root coordinates a two-app setup. Product code lives in `viaje-chavales-front/` and `viaje-chavales-back/`.
- `viaje-chavales-front/` is an Angular 18 standalone app with route-level screens, service-driven API access, Angular Material date/form controls, `ngx-toastr`, and Socket.IO chat.
- `viaje-chavales-back/` is a NestJS 10 API with Prisma/PostgreSQL, HTTP auth middleware, and a Socket.IO gateway for group chat.
- Default local runtime is frontend `http://localhost:4200` and backend `http://localhost:3000`.

## Agent Workflow
- Read `.codex-orchestration/project-context.md` before planning cross-file work.
- For multi-file or risky tasks, use the Planner -> Coder -> Verifier -> Tester pipeline defined in `.codex-orchestration/`.
- For any visible frontend or UX change, explicitly load `$top-tier-ux-ui` before deciding layout, styling, typography, or motion.
- Keep per-task decisions in `.codex-orchestration/handoffs/`; do not put project-specific internals into global skills.

## Codebase Rules
- Preserve Angular standalone component patterns and existing route/service organization.
- If an API contract changes, update the Nest controller/service side and the Angular service/interface side in the same task.
- Avoid adding dependencies unless the current stack clearly cannot support the requirement.
- Keep environment-specific values in the app env files; do not hardcode production secrets or alternative base URLs in components.
- Treat Prisma schema, migrations, DTOs, and controllers/services as one unit when backend data shape changes.

## Verification Baseline
- Frontend-visible change: prefer dev-time verification without production build; verify the affected route on desktop and mobile widths; check loading, empty, error, hover, and focus states when applicable.
- Backend change: run the most relevant `npm run test` or `npm run test:e2e` command in `viaje-chavales-back/` when feasible.
- Prisma or auth change: validate the impacted flow manually end-to-end against the local API.
- Chat change: validate Socket.IO connection, join flow, historical messages, and live message delivery.
- Default rule: run local dev tests/checks without building.
- Only require build-driven verification when the change is architectural, dependency-heavy, bootstrap-level, or otherwise risky enough that dev checks are insufficient.

## Core Product Flows
- Auth: register, optionally create/join a group, then log in.
- Home: inspect free-day overlap, charting, invite flow, and group chat.
- Free days: create, edit, and delete availability ranges.
- Trips: create trip proposals, browse lists, join/leave, comment, and edit owned trips.

# Viaje Chavales Frontend

Angular 18 app for group travel planning, onboarding by invite link, free-days management,
trip proposals, comments, participation, and realtime chat by group.

## Stack

- Angular 18 standalone components
- Angular Material
- Socket.IO client
- `ngx-toastr`

## Local run

```bash
cd viaje-chavales-front
npm install
npm run start
```

App URL: `http://localhost:4200`

The frontend expects backend API at `http://localhost:3000` via environment settings.

## Core routes

- `/login`
- `/register`
- `/join`
- `/home`
- `/groups`
- `/freedays`
- `/trips`

Route configuration: `src/app/app.routes.ts`.

## Quick checks (recommended)

```bash
cd viaje-chavales-front
npx tsc --noEmit -p tsconfig.json
```

Use browser/manual checks for route behavior, responsive layout, and realtime chat flows.

## Related docs

- Project context: `../.codex-orchestration/project-context.md`
- Deployment: `../docs/deployment.md`
- E2E trigger matrix: `../.codex-orchestration/agents/e2e-trigger-matrix.md`

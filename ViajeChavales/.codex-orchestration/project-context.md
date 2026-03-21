# Project Context

## Purpose
- What this product does: coordinates travel planning for a private group of friends, including group creation/joining, free-day availability, trip proposals, comments, participation, invite links, and realtime group chat.
- Primary user flows:
- Register and either create a new group or join an existing one by query-string invite.
- Log in and land on the home dashboard.
- Add or edit free-day ranges, then inspect overlap by season/year.
- Create trip proposals, inspect trip detail, comment, and join or leave participation.
- Use group chat and invite flows from shared UI areas.

## Architecture
- Tech stack: Angular 18 standalone frontend, NestJS 10 backend, Prisma ORM, PostgreSQL, Socket.IO, Angular Material, `ngx-toastr`.
- Entry points:
- Frontend bootstrap: `viaje-chavales-front/src/main.ts`
- Frontend routes: `viaje-chavales-front/src/app/app.routes.ts`
- Backend bootstrap: `viaje-chavales-back/src/main.ts`
- Backend module graph: `viaje-chavales-back/src/app.module.ts`
- Database schema: `viaje-chavales-back/prisma/schema.prisma`
- Key directories:
- Frontend screens: `viaje-chavales-front/src/app/components/`
- Frontend services/interfaces: `viaje-chavales-front/src/app/core/`
- Backend modules: `viaje-chavales-back/src/`
- Prisma schema and migrations: `viaje-chavales-back/prisma/`

## Functional Map
- Auth and group onboarding:
- Files: `viaje-chavales-front/src/app/components/login/`, `viaje-chavales-front/src/app/components/register/`, `viaje-chavales-front/src/app/core/services/users.service.ts`, `viaje-chavales-front/src/app/core/services/groups.service.ts`, `viaje-chavales-back/src/auth/`, `viaje-chavales-back/src/users/`, `viaje-chavales-back/src/groups/`
- Dependencies: JWT auth, group creation/join, local storage token flow, route guard.
- Home dashboard:
- Files: `viaje-chavales-front/src/app/components/home/`, `viaje-chavales-front/src/app/components/shared/chat/`, `viaje-chavales-front/src/app/components/shared/graph/`, `viaje-chavales-front/src/app/components/shared/invite/`
- Dependencies: free days service, trips service, group data, chat socket.
- Free days:
- Files: `viaje-chavales-front/src/app/components/freedays/`, `viaje-chavales-front/src/app/core/services/freedays.service.ts`, `viaje-chavales-back/src/freedays/`
- Dependencies: Angular reactive forms, date adapters, Prisma `FreeDays` model.
- Trips and comments:
- Files: `viaje-chavales-front/src/app/components/trips/`, `viaje-chavales-front/src/app/core/services/trips.service.ts`, `viaje-chavales-back/src/trips/`, `viaje-chavales-back/src/comments/`, `viaje-chavales-back/src/participants/`
- Dependencies: trip CRUD, participant membership, comments, owner vs non-owner behavior.
- Group chat:
- Files: `viaje-chavales-front/src/app/core/services/chat.service.ts`, `viaje-chavales-front/src/app/components/shared/chat/`, `viaje-chavales-back/src/chat/`, `viaje-chavales-back/src/core/middlewares/ws-auth.middleware.ts`
- Dependencies: Socket.IO gateway, room join flow, historical message fetch, live message broadcast.

## Run & Verify
- Install:
- Frontend: `cd viaje-chavales-front && npm install`
- Backend: `cd viaje-chavales-back && npm install`
- Backend DB: ensure PostgreSQL is available and `DATABASE_URL` resolves before Prisma-backed flows.
- Dev run:
- Frontend: `cd viaje-chavales-front && npm run start`
- Backend: `cd viaje-chavales-back && npm run start:dev`
- Local URLs: frontend `http://localhost:4200`, backend `http://localhost:3000`
- Build:
- Frontend: `cd viaje-chavales-front && npm run build`
- Backend: `cd viaje-chavales-back && npm run build`
- Tests:
- Frontend: prefer dev-time checks first, e.g. `cd viaje-chavales-front && npx tsc --noEmit -p tsconfig.json`; use `npm run test -- --watch=false` when browser-backed tests are practical.
- Backend unit: `cd viaje-chavales-back && npm run test`
- Backend e2e: `cd viaje-chavales-back && npm run test:e2e`
- Build is not the default verification path; reserve it for architecture/dependency/bootstrap changes or when dev checks cannot cover the risk.

## Constraints
- Security/performance constraints:
- Backend auth middleware protects most routes; onboarding exceptions are `POST /users` and `POST /groups`.
- Chat is currently permissive on CORS and should be treated carefully during auth or deployment work.
- Frontend does multiple sequential requests in some flows; avoid introducing extra fan-out without reason.
- Coding conventions:
- Preserve Angular standalone component style and current service-per-domain organization.
- Prefer minimal diffs; keep API contracts aligned across DTOs, Prisma, Nest controllers/services, and Angular interfaces/services.
- For visible UI work, use `$top-tier-ux-ui` and centralize tokens instead of scattering one-off style values.
- Environments and secrets policy:
- Frontend and backend each have local `.env` files; do not print or commit secret values.
- Frontend default API URL is `http://localhost:3000` via environment config and should stay environment-driven.

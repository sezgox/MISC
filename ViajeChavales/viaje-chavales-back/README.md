# Viaje Chavales Backend

NestJS 10 API with Prisma/PostgreSQL for authentication, groups, free days, trips,
participants, comments, and realtime chat.

## Stack

- NestJS 10
- Prisma ORM
- PostgreSQL
- Socket.IO gateway
- JWT-based auth middleware

## Local run

```bash
cd viaje-chavales-back
npm install
npm run start:dev
```

API URL: `http://localhost:3000`

## Test commands

```bash
cd viaje-chavales-back
npm run test
npm run test:e2e
```

Run the most relevant test suite for touched modules before merge.

## Module map

- Auth/users/groups: onboarding and membership
- Free days: availability windows and overlap usage
- Trips/comments/participants: planning lifecycle and interactions
- Chat gateway: realtime messages scoped by group

Main entry points:

- Bootstrap: `src/main.ts`
- Module graph: `src/app.module.ts`
- DB schema: `prisma/schema.prisma`

## Related docs

- Project context: `../.codex-orchestration/project-context.md`
- Deployment: `../docs/deployment.md`
- E2E trigger matrix: `../.codex-orchestration/agents/e2e-trigger-matrix.md`

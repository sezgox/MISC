# Planner Handoff

## Objective
Implement invite flow for multi-group model using `/join?group=...` and remove in-app join-by-ID UI.

## System Map
- Backend public group read: `viaje-chavales-back/src/groups/*`
- Front routes/auth/login/register/invite/navbar: `viaje-chavales-front/src/app/*`
- New public join screen: `viaje-chavales-front/src/app/components/join/*`

## Change Plan
- File: `viaje-chavales-back/src/groups/groups.service.ts`
  - Edit: Add `findInvitePreview` with member summary.
  - Why: `/join` needs group metadata without auth.
- File: `viaje-chavales-back/src/groups/groups.controller.ts`
  - Edit: Add `GET /groups/:id/invite`.
  - Why: Stable endpoint for invite preview.
- File: `viaje-chavales-front/src/app/components/join/*`
  - Edit: New standalone screen for invite flows.
  - Why: Replace direct register-link pattern with explicit join decision.
- File: `viaje-chavales-front/src/app/components/login/*`
  - Edit: Handle `?group` and auto-join after login.
  - Why: Existing users must join invited group after auth.
- File: `viaje-chavales-front/src/app/components/shared/invite/invite.component.ts`
  - Edit: Link changed to `/join?group=`.
  - Why: New entrypoint.
- File: `viaje-chavales-front/src/app/components/shared/navbar/*`
  - Edit: Remove join-by-ID controls.
  - Why: User requested single invite path.
- File: `viaje-chavales-front/src/app/core/guards/auth.ts`
  - Edit: Accept `/login?*` as public route.
  - Why: Prevent losing invite context.

## Test Plan
- Command: `npx tsc --noEmit -p tsconfig.json` (front)
  - Expected: Pass.
- Command: `npx tsc --noEmit -p tsconfig.json` (back)
  - Expected: Pass.
- Command: `npx jest --passWithNoTests` (back)
  - Expected: Pass even with empty suite.
- Command: MCP browser desktop/mobile on `/join`, `/login?group=...`, `/home`
  - Expected: Correct button sets per auth state and no `+ ID` controls.

## Acceptance Criteria
- [x] Invite URL points to `/join?group=`.
- [x] `/join` shows group data and members.
- [x] Logged-out flow supports register/login with preserved group query.
- [x] Logged-in flow can join/activate group.
- [x] Navbar no longer supports join-by-ID.

## Risks & Mitigations
- Risk: Guard strips `group` query in login flow.
  - Mitigation: Explicit `state.url.startsWith('/login?')` handling.

## Execution Order
1. Backend invite preview endpoint.
2. Front join route/component and invite link update.
3. Login/register context wiring.
4. Remove join-by-ID UI.
5. Compile/tests + MCP verification.

## Done Definition
- All acceptance criteria validated in code + MCP.

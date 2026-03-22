# Coder Notes

## Implemented Changes
- Added backend invite preview endpoint `GET /groups/:id/invite` with flattened `members` payload.
- Added new public `JoinComponent` and `/join` route.
- Invite links now target `/join?group=<id>`.
- Login now preserves invite context via query param and auto-joins invited group after successful auth.
- Register login-link preserves `group` query when present.
- Removed join-by-ID controls and logic from desktop/mobile navbar.
- Updated guard public route logic to allow `/login?*`, `/register?*`, and `/join?*` patterns.

## Out-of-Scope Decisions
- No DB schema change required.
- No change to existing `POST /users/groups/:groupId/join` contract.

## Deviations From Planner
- Replaced block-syntax conditional in join actions with `*ngIf` + `ng-template` after observing transient duplicated actions under SSR hydration.

## Open Risks
- Join page can render a short loading/transition state during hydration for logged-in users; functional behavior is correct after hydration completes.

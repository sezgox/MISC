# Tester Report

## Environment
- URL: `https://trips.devogs.com`
- Build: Dockerized frontend/backend rebuilt from current workspace.
- Browser: MCP Playwright (desktop and mobile viewport).

## Scenarios Executed
1. Open `/join?group=<id>` while logged out.
2. Click-through path to `/login?group=<id>` and verify query preserved.
3. Login with invited group context and verify redirect to `/home` with success toast.
4. Open `/join?group=<id>` while logged in and verify only logged-in action button appears.
5. Check desktop and mobile nav to confirm join-by-ID control removed.

## Observed Results
- Logged-out join screen shows group info, member list, and two actions (register/login).
- Logged-in join screen shows single action (`Ir a este grupo` or join action).
- Login flow with invite query now keeps context and links register with same group query.
- Mobile and desktop group selectors no longer display `+ ID` join entry.

## Failures/Repro Steps
- Initial issue found: `/login?group=...` was redirected to `/login` due guard route check.
- Fixed by broadening public-route matching in auth guard.

## Artifacts
- Snapshot references collected in MCP session for `/join`, `/login?group`, and `/home` at desktop/mobile sizes.
- Console includes normal socket connect log only.

## Recommendation
- Accept changes. Keep this invite model as single source of truth for joining groups.

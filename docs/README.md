# PWs Global Docs

- `hosting-playbook.md`: global standard to dockerize, bootstrap, publish, and partially redeploy apps (includes Cloudflare `devogs-ingress` routing and teardown).
- `apps-active-registry.md`: live registry of active apps, host ports, domains, and deploy entrypoints.
- `logging-runbook.md`: log handling, retention policy, and per-app log commands for laptop/VPS hosting.
- `roadmap-global-pws.md`: global roadmap for cross-app hosting, CI/CD, and ops initiatives.

**Cloudflare Tunnel (shared ingress):** `ViajeChavales/docs/cloudflare-tunnel.md` — route all public hostnames to `http://devogs-ingress:80`; troubleshooting for wrong subdomain / WebSocket issues is in section 6.1.

Keep these files updated whenever a new app gets `init-app`/deploy scripts or changes hosting config.

# Bootstrap de servidor (runner self-hosted + producción)

Checklist para un **servidor nuevo** o reinstalación del host donde corre el deploy: con Docker instalado y el mismo repositorio, el despliegue completo se puede hacer desde GitHub Actions sin depender de qué archivos cambiaron en `main`.

## Requisitos en el host

| Requisito | Detalle |
|-----------|---------|
| SO | Linux x86_64 |
| Docker | Docker Engine + plugin Compose v2 (`docker compose`) |
| Usuario del runner | Usuario dedicado recomendado; debe poder usar Docker (grupo `docker` o equivalente) |
| Red | Salida HTTPS hacia GitHub y hacia Cloudflare (túnel QUIC) |

## GitHub Actions runner

1. Instalar el [actions-runner](https://github.com/actions/runner) en una ruta fija (p. ej. `/home/deploy/actions-runner`).
2. Registrar el runner en el repositorio con las **mismas etiquetas** que usa el workflow: `self-hosted`, `Linux`, `X64`.
3. Servicio **systemd** (opcional pero recomendado) para que el runner arranque al reiniciar el servidor.

## Secretos (Settings → Secrets and variables → Actions)

Deben existir los mismos secretos que en el entorno anterior (no hace falta rotar el token del túnel solo por cambiar de servidor si sigues usando el mismo túnel de Cloudflare):

- `DEPLOY_ENV_VIAJECHAVALES` — cuerpo completo de `ViajeChavales/.env`
- `DEPLOY_ENV_GAEL_GAMES` — cuerpo completo de `Gael-Games/.env`
- `DEPLOY_ENV_PORTFOLIO` — cuerpo completo de `Portfolio/.env`
- `DEPLOY_ENV_CLOUDFLARE_TUNNEL` — típicamente `CLOUDFLARED_TUNNEL_TOKEN=...` en `infra/cloudflare-tunnel/.env`

El job **bootstrap** exige los cuatro; si falta alguno, el workflow falla de forma explícita.

## Primer despliegue en el servidor vacío

1. Asegúrate de que el runner está **online** en GitHub (pestaña Actions → Runners).
2. En **Actions** → workflow **Deploy Changed Apps** → **Run workflow**.
3. Activa **`full_stack_deploy`** (bootstrap all apps + tunnel) y ejecuta.

Esto corre [`scripts/init-and-deploy-all.sh`](../scripts/init-and-deploy-all.sh): levanta ViajeChavales, Gael-Games y Portfolio (según `.env`) y el contenedor `pws-cloudflared`, y comprueba que el túnel está en ejecución.

No hace falta hacer un commit que toque rutas de infraestructura ni depender de los filtros por paths.

### Túnel solo

Si solo quieres refrescar el conector Cloudflare sin rehacer todo el stack, usa **`refresh_tunnel`** (y deja `full_stack_deploy` desactivado). El bootstrap ya incluye el túnel; no hace falta marcar ambos.

## Migración desde otro servidor

- **Mismo token de túnel:** el nuevo host puede usar el mismo `CLOUDFLARED_TUNNEL_TOKEN`; Cloudflare admite varios conectores. Durante la transición, apaga el runner o el contenedor `pws-cloudflared` en el servidor antiguo cuando el nuevo ya esté validado, para evitar confusión operativa.
- **Base de datos:** un servidor nuevo con volumen vacío inicializa Postgres con las credenciales del secret. Para **llevar datos** del servidor viejo hace falta backup/restore (pg_dump / volumen) fuera del alcance del workflow; véase operación manual o runbook de backup.

## Push a `main` después del bootstrap

Los pushes siguientes usan el workflow **por rutas** (solo reconstruyen lo que cambió). El job `teardown-selfhosted` solo se ejecuta si marcas **`force_teardown`** en `workflow_dispatch` o si el push toca rutas **`infra_critical`**; si no aplica, ese job queda omitido y los deploys siguen gracias a la condición del workflow sobre el resultado del teardown (`success` u `skipped`).

## Referencias

- [hosting-playbook.md](hosting-playbook.md)
- [apps-active-registry.md](apps-active-registry.md)
- [ViajeChavales/docs/cloudflare-tunnel.md](../ViajeChavales/docs/cloudflare-tunnel.md)

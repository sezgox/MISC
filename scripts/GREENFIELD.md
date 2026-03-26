# Greenfield deploy (servidor virgen / reinicio completo)

## Vía GitHub Actions (recomendado)

1. Asegura un **runner self-hosted** en el servidor, en línea, con etiquetas: `self-hosted`, `Linux`, `X64`.
2. En el repositorio: **Settings → Secrets and variables → Actions**, define los cuatro secretos `DEPLOY_ENV_*` (contenido completo de cada `.env`; ver cabecera de `.github/workflows/deploy-selfhosted.yml`).
3. **Actions → Deploy Changed Apps → Run workflow** (rama `main`).
4. Activa **solo** **NEW_DEPLOY (init-and-deploy-all)**. Eso ejecuta **teardown** de stacks Docker existentes y luego ejecuta `scripts/init-and-deploy-all.sh`.
5. Resultado esperado en la UI: **detect-changes**, **teardown-selfhosted** y **deploy-all-selfhosted** en verde; el resto de jobs de deploy (por paths) en **Skipped**.

No hace falta marcar **Force teardown** si ya marcaste `new_deploy`: el teardown ya corre en ese flujo.

## Vía línea de comandos en el servidor (sin Actions)

1. Clona el repo y sitúate en la raíz del monorepo.
2. Crea estos archivos (permisos restrictivos recomendados, p. ej. `chmod 600`):

   - `ViajeChavales/.env` — ver `ViajeChavales/.env.example`
   - `Gael-Games/.env` — ver `Gael-Games/.env.example`
   - `Portfolio/.env` — ver `Portfolio/.env.example`
   - `infra/cloudflare-tunnel/.env` — al menos `CLOUDFLARED_TUNNEL_TOKEN=...`

3. Requisitos: **Docker** y plugin **docker compose**; el usuario que ejecuta el script debe poder usar `docker`.
4. Ejecuta:

   ```bash
   bash scripts/init-and-deploy-all.sh
   ```

   El script crea la red `devogs_edge` si falta, levanta las tres apps (`*/init-app`), el ingress compartido (`infra/ingress/up.sh`) y el conector Cloudflare (`pws-cloudflared`), y comprueba que el túnel esté en ejecución.

## Cold start (sin contenedores previos)

Los `init-app` usan `docker compose up -d --build` sobre cada app; no dependen de volúmenes creados a mano. ViajeChavales genera credenciales en `.env` solo si no existe el archivo; en producción Actions/bootstrap ya escriben `.env` desde secretos. El ingress solo necesita red `devogs_edge` (la crea `ensure-devogs-edge-network.sh`). El túnel necesita token válido en `infra/cloudflare-tunnel/.env` (o en `ViajeChavales/.env` como respaldo según el script).

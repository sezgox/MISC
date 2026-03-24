# Planner Handoff

## Objective
Corregir de forma integral el flujo multi-grupo en Trips para que no dependa de "grupo activo", restaurar acciones rotas en frontend (validar/rechazar usuarios, votar proposals, comentar), y anadir selector explicito de grupo en creacion/listado de viajes.

## System Map
- Frontend Angular:
  - `groups.component` ejecuta validar/rechazar usuarios de grupo.
  - `trips.component` crea/lista trips y actualmente depende de `ActiveGroupService`.
  - `trip-card.component` navega a detalle de trip sin contexto de grupo.
  - `trip-view.component` vota/comenta/gestiona proposals y tambien depende de `ActiveGroupService`.
  - `auth.interceptor` inyecta cabecera `X-Group-Id` si no se especifica.
- Backend Nest:
  - `auth.middleware` resuelve `req.user.group` desde `X-Group-Id` o grupo activo.
  - `users.updateRole/remove` usan `req.user.group`.
  - `trips.findOne` no valida grupo de request (riesgo de cruce de grupo).

## Visual Direction
Warm Utility Clean: mantener el look actual, pero con controles mas claros y compactos para selector de grupo, priorizando legibilidad en movil.

## Change Plan
- Fix validar/rechazar desde Groups:
  - `viaje-chavales-front/src/app/components/groups/groups.component.ts`
  - `viaje-chavales-front/src/app/core/services/users.service.ts` (si aplica)
  - Confirmar error HTTP actual del click `Validar` y corregir serializacion de `username`/header.
- Eliminar dependencia funcional de "grupo activo" en Trips:
  - `viaje-chavales-front/src/app/components/trips/trips.component.ts`
  - `viaje-chavales-front/src/app/components/trips/trips.component.html`
  - `viaje-chavales-front/src/app/components/trips/trip-card/trip-card.component.html`
  - Cambios:
    - selector de grupo explicito en formulario de creacion;
    - carga/listado de trips por grupo seleccionado;
    - navegacion a detalle con `groupId` en query param.
- Rehabilitar votos y comentarios en detalle de trip:
  - `viaje-chavales-front/src/app/components/trips/trip-view/trip-view.component.ts`
  - Cambios:
    - resolver `groupId` por `trip.groupId` (o query param), no por `ActiveGroupService`;
    - usar ese `groupId` en votar/desvotar/comentar y resto de mutaciones.
- Endurecer backend de detalle por grupo:
  - `viaje-chavales-back/src/trips/trips.controller.ts`
  - `viaje-chavales-back/src/trips/trips.service.ts`
  - Cambios:
    - `GET /trips/:id` valida que el trip pertenece a `req.user.group`.
- Ajustes visuales menores en Trips:
  - mantener estilo existente y no romper mobile.

## Test Plan
- Front dev checks:
  - `cd viaje-chavales-front && npx tsc --noEmit -p tsconfig.app.json`
- Back dev checks:
  - `cd viaje-chavales-back && npm run test -- --runInBand`
- MCP E2E (desktop + movil):
  - `groups`: validar y rechazar usuario pending.
  - `trips`: crear trip seleccionando grupo explicito.
  - `trip-view`: votar proposal y enviar comentario.
- No build como criterio principal; build/deploy solo al final para publicar fix.

## Acceptance Criteria
- En Groups, `Validar` y `Rechazar` funcionan desde UI para usuarios pending.
- En Trips, crear viaje permite elegir grupo explicito (sin depender de grupo activo).
- En Trip Detail, votar proposal y comentar vuelven a funcionar.
- `GET /trips/:id` queda restringido al grupo del request.
- QA MCP sin regresiones visibles en desktop/movil para esos flujos.

## Risks & Mitigations
- Riesgo: romper flows que aun esperan `ActiveGroupService`.
  - Mitigacion: limitar cambios al dominio Trips y mantener interceptor compatible.
- Riesgo: query param de `groupId` ausente en links antiguos.
  - Mitigacion: fallback a `trip.groupId` tras primer fetch.
- Riesgo: stale UI por SSR/hidratacion.
  - Mitigacion: verificar con MCP tras deploy y forzar recarga.

## Execution Order
1. Corregir validacion/rechazo en Groups y verificar con MCP.
2. Refactor Trips compose/list a selector de grupo explicito.
3. Refactor TripView para usar contexto de grupo del trip.
4. Endurecer backend `findOne` por grupo.
5. Ejecutar checks/tests + MCP E2E.
6. Deploy frontend/backend y revalidar.

## Done Definition
- Codigo actualizado en frontend/backend segun plan.
- Verificacion local y MCP completada con resultados PASS.
- `trips.devogs.com` reflejando fixes de los 4 puntos reportados.

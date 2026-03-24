# E2E Trigger Matrix (Verifier + Tester)

## Uso obligatorio
1. Antes de verificar, listar ficheros cambiados (`git diff --name-only <base>...HEAD`).
2. Si un cambio coincide con cualquier `trigger` de un flujo, ejecutar ese flujo completo E2E.
3. Si se tocan ficheros compartidos criticos, ejecutar **todos** los flujos:
   - `viaje-chavales-back/prisma/schema.prisma`
   - `viaje-chavales-back/prisma/migrations/**`
   - `viaje-chavales-back/src/core/middlewares/auth.middleware.ts`
   - `viaje-chavales-front/src/app/core/services/active-group.service.ts`
   - `viaje-chavales-front/src/app/app.routes.ts`
4. Registrar en `verifier-report.md` y/o `tester-report.md`:
   - flujos ejecutados,
   - pasos,
   - resultado por paso,
   - bloqueos con evidencia.

## Flujo AUTH

### Cobertura funcional
- Login.
- Register.
- JoinGroup desde:
  - usuario no logueado -> Register (`/join?group=...`),
  - usuario no logueado -> Login (`/join?group=...`),
  - usuario logueado.

### Triggers backend
- `viaje-chavales-back/src/auth/**`
- `viaje-chavales-back/src/users/**`
- `viaje-chavales-back/src/groups/**`
- `viaje-chavales-back/src/core/middlewares/auth.middleware.ts`
- `viaje-chavales-back/src/core/middlewares/ws-auth.middleware.ts`

### Triggers frontend
- `viaje-chavales-front/src/app/components/login/**`
- `viaje-chavales-front/src/app/components/register/**`
- `viaje-chavales-front/src/app/components/join/**`
- `viaje-chavales-front/src/app/core/guards/auth.ts`
- `viaje-chavales-front/src/app/core/services/users.service.ts`
- `viaje-chavales-front/src/app/core/services/groups.service.ts`
- `viaje-chavales-front/src/app/components/shared/invite/**`

### Criterios de aceptacion
- Login y Register generan sesion valida.
- JoinGroup funciona en los 3 escenarios anteriores.
- Tras login/register/join, el usuario queda en el grupo correcto.
- Redirecciones respetan query `group`.

## Flujo GROUPS ACTIONS

### Cobertura funcional
- Crear grupo.
- Validar/rechazar usuario en grupo.
- Disolver grupo (feature nueva):
  - eliminar registros relacionados del grupo (chat, viajes, propuestas y derivados).
- Chat por grupo:
  - enviar solo al chat del grupo seleccionado,
  - recibir en tiempo real solo en miembros del grupo.

### Triggers backend
- `viaje-chavales-back/src/groups/**`
- `viaje-chavales-back/src/users/**`
- `viaje-chavales-back/src/chat/**`
- `viaje-chavales-back/src/trips/**`
- `viaje-chavales-back/src/comments/**`
- `viaje-chavales-back/src/participants/**`
- `viaje-chavales-back/prisma/schema.prisma`
- `viaje-chavales-back/prisma/migrations/**`

### Triggers frontend
- `viaje-chavales-front/src/app/components/groups/**`
- `viaje-chavales-front/src/app/components/join/**`
- `viaje-chavales-front/src/app/components/shared/chat/**`
- `viaje-chavales-front/src/app/components/shared/invite/**`
- `viaje-chavales-front/src/app/core/services/chat.service.ts`
- `viaje-chavales-front/src/app/core/services/users.service.ts`
- `viaje-chavales-front/src/app/core/services/groups.service.ts`

### Criterios de aceptacion
- Crear grupo visible en dashboard de grupos.
- Validar/rechazar usuarios aplica permisos de admin y refleja estado real.
- Disolver grupo elimina datos relacionados y no deja huerfanos.
- Mensajes chat se aislan por `groupId`.

## Flujo PRE-PLANNING

### Cobertura funcional
- Alta/edicion/borrado de dias libres.
- Visibilidad en graficas.
- Regla clave: anadir dias libres sin importar grupo/rol (incluyendo pending o sin grupo).

### Triggers backend
- `viaje-chavales-back/src/freedays/**`
- `viaje-chavales-back/src/core/middlewares/auth.middleware.ts`
- `viaje-chavales-back/src/users/**`

### Triggers frontend
- `viaje-chavales-front/src/app/components/freedays/**`
- `viaje-chavales-front/src/app/components/home/**`
- `viaje-chavales-front/src/app/components/shared/graph/**`
- `viaje-chavales-front/src/app/core/services/freedays.service.ts`
- `viaje-chavales-front/src/app/core/services/active-group.service.ts`

### Criterios de aceptacion
- No hay bloqueo por rol/grupo para gestionar dias libres propios.
- Graficas muestran correctamente disponibilidad segun filtros.
- No hay errores 400 falsos por mezcla de grupos.

## Flujo PLANNING

### Cobertura funcional
- Crear viaje (solo dentro de dias libres del creador).
- Unirse a viaje.
- Asignar rol en viaje.
- Crear propuesta (role/type).
- Votar propuesta.
- Aceptar propuesta (solo planner).
- Visibilidad de viaje en graficas.
- Comentarios.
- Restriccion: usuarios no verificados en grupo no pueden operar planificacion.
- **Obligatorio**: al crear viaje se debe indicar explicitamente a que grupo se asigna.

### Triggers backend
- `viaje-chavales-back/src/trips/**`
- `viaje-chavales-back/src/participants/**`
- `viaje-chavales-back/src/comments/**`
- `viaje-chavales-back/src/core/utils/trip-domain.ts`
- `viaje-chavales-back/src/freedays/**`
- `viaje-chavales-back/prisma/schema.prisma`
- `viaje-chavales-back/prisma/migrations/**`

### Triggers frontend
- `viaje-chavales-front/src/app/components/trips/**`
- `viaje-chavales-front/src/app/components/home/**`
- `viaje-chavales-front/src/app/components/shared/graph/**`
- `viaje-chavales-front/src/app/core/services/trips.service.ts`
- `viaje-chavales-front/src/app/core/services/participants.service.ts`
- `viaje-chavales-front/src/app/core/services/comments.service.ts`
- `viaje-chavales-front/src/app/core/services/active-group.service.ts`

### Criterios de aceptacion
- Alta de viaje bloqueada fuera de dias libres del creador.
- Alta de viaje exige grupo destino explicito y persistencia en ese grupo.
- Permisos de planner/roles se respetan en propuestas y aceptacion.
- Votaciones y estado de propuestas consistentes.
- Comentarios y visibilidad en graficas coherentes con el estado del viaje.

## Plantilla minima de reporte para Verifier/Tester
- `Flow`: AUTH / GROUPS ACTIONS / PRE-PLANNING / PLANNING
- `Trigger match`: ficheros que activaron el flujo
- `Steps`: lista de pasos ejecutados
- `Result`: PASS / FAIL / BLOCKED
- `Evidence`: endpoint/pantalla/log relevante

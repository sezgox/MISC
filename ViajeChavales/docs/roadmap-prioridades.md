# Roadmap de siguientes pasos (ViajeChavales)

Este documento recoge lo siguiente a ejecutar tras el repaso funcional y técnico.

## Prioridades

- **P0 (max priority)**: bloquear riesgos funcionales o de seguridad y cerrar huecos de UX críticos.
- **P1 (alta)**: robustecer estabilidad, contratos y calidad de validación.
- **P2 (media)**: deuda técnica, consistencia y mejoras de experiencia.

## P0 - Max Priority

### 1) Comentarios y votación en grupos (front pendiente, revisar back)
- **Objetivo**: habilitar en frontend la funcionalidad de comentarios y votación por grupo y validar que el backend aplica aislamiento correcto por `groupId`.
- **Contexto**: hay capacidad de comentarios/votaciones en backend, pero falta confirmar/terminar su exposición y experiencia completa en frontend para escenarios multi-grupo.
- **Tareas**:
  - Revisar endpoints reales de comentarios/votos y su contrato en frontend.
  - Garantizar envío de `X-Group-Id` en todas las acciones relacionadas.
  - Verificar en UI que comentario/voto nunca mezcla datos entre grupos.
  - Añadir pruebas de integración backend para aislamiento por grupo.
- **Criterio de aceptación**:
  - Crear/eliminar comentario y votar/desvotar funciona en el grupo activo.
  - No se ven ni afectan comentarios/votos de otros grupos.
  - Flujo validado en desktop y móvil.

### 2) Normalizar manejo de errores HTTP en backend
- **Objetivo**: evitar respuestas ambiguas (ej. `200` con objeto de excepción serializado).
- **Contexto**: hay controladores/middleware que usan `res.json(new Exception(...))` en lugar de `throw`.
- **Tareas**:
  - Reemplazar respuestas manuales por `throw` de excepciones Nest donde aplique.
  - Unificar formato de error y códigos HTTP.
  - Cubrir con tests de status code esperados.
- **Criterio de aceptación**:
  - Errores auth/validación devuelven HTTP correcto (401/403/400).
  - Frontend recibe payload de error consistente.

### 3) Revisar posible fuga en `freedays` para usuarios sin grupo
- **Objetivo**: impedir consultas de disponibilidad de terceros en escenarios sin grupo activo.
- **Contexto**: si no hay grupo activo y entra `username` por query, hay riesgo de acceso no esperado.
- **Tareas**:
  - Restringir lectura a `req.user.sub` cuando no haya grupo.
  - Revisar reglas de `findAll` para no abrir scope por parámetro externo.
  - Añadir test de regresión.
- **Criterio de aceptación**:
  - Usuario sin grupo solo consulta sus propios free-days.
  - No hay acceso cruzado por `username` query param.

## Hecho recientemente

- **Permisos en Viajes al cambiar de grupo (tab Trips)**: `currentSelectedGroupRole` desde `getCurrentUser` del grupo seleccionado; refresh antes de `addTrip`; aviso `Pending` alineado. Deploy parcial frontend (`deploy-part.ps1 -Target frontend`).

## P1 - Alta

### 4) Endurecer CORS y auth de chat Socket.IO
- Limitar `origin` por entorno en gateway.
- Confirmar verificación de membresía/permiso antes de `join_chat`.
- Testear conexión, join, histórico y envío en tiempo real por grupo.

### 5) Mapear errores Prisma a errores de dominio
- Traducir errores conocidos (`not found`, duplicados, etc.) a `BadRequest/Conflict/NotFound`.
- Evitar 500 genéricos en operaciones de votos/roles/proposals.

### 6) Cobertura de pruebas orientada a flujos E2E de matriz
- Alinear verificación con `.codex-orchestration/agents/e2e-trigger-matrix.md`.
- Dejar evidencia por flujo: AUTH, GROUPS ACTIONS, PRE-PLANNING, PLANNING.

### 7) Integrar nueva WebMCP API para HTML/JS (atributos para agentes)
- **Objetivo**: incorporar una API WebMCP orientada a frontend HTML/JS y definir atributos de contexto que permitan a agentes ejecutar tareas UI de forma fiable.
- **Tareas**:
  - Diseñar contrato de atributos mínimos en componentes y vistas (identidad semántica, estado, permisos y contexto de grupo).
  - Añadir atributos estables en HTML para selección/automatización del agente (evitar acoplarse a clases visuales).
  - Documentar convenciones de naming y uso para Angular templates.
  - Verificar que los flujos críticos (auth, groups, trips, chat) quedan navegables por agente vía esos atributos.
- **Criterio de aceptación**:
  - El agente puede identificar y operar elementos críticos sin depender de texto cambiante ni estilos.
  - La documentación incluye guía de atributos requeridos por flujo.
  - Se valida en navegador con al menos un flujo completo por área crítica.

## P2 - Media

### 8) Limpieza de deuda técnica frontend
- Eliminar métodos vacíos o placeholders (ej. `toggleTripsOverlay`).
- Revisar logs de consola y centralizar reporting de errores.

### 9) Consistencia de documentación operativa
- Mantener `README` de front/back y `docs/deployment.md` sincronizados con comportamiento real.
- Documentar explícitamente contratos de cabecera `X-Group-Id` en rutas críticas.

## Orden sugerido de ejecución

1. P0.1 comentarios y votación por grupo (front + validación back)
2. P0.2 normalización de errores HTTP
3. P0.3 aislamiento de `freedays`
4. P1.4 chat CORS/auth
5. P1.5 mapeo errores de dominio
6. P1.6 pruebas por matriz E2E
7. P1.7 WebMCP API HTML/JS + atributos para agentes
8. P2.8 y P2.9 limpieza/documentación

## Notas de implementación

- Para cualquier cambio de contrato API, actualizar backend y frontend en la misma tarea.
- Para cambios visibles en UI, validar desktop y mobile con estados `loading`, `empty`, `error`, `hover`, `focus`.
- Evitar builds completas como verificación por defecto; priorizar checks de desarrollo y pruebas dirigidas.

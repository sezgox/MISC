# Coder Notes

## Implemented
- `auth.middleware.ts`
  - Se añadió bypass controlado para `/freedays` cuando el usuario no tiene memberships.
- `freedays.controller.ts`
  - Eliminada validación `assertUserCanEdit` para CRUD de free days.
  - `GET /freedays` ahora hace fallback al usuario autenticado si no hay `groupId`.
  - Se añadió control nulo en update/delete para evitar acceso sobre registros inexistentes.
- `freedays.service.ts`
  - Eliminado `assertUserCanEdit` y su dependencia a `ensureApprovedUserForGroup`.
- `chat.gateway.ts`
  - `join_chat` y `leave_chat` aceptan payload con `groupId`.
  - `new_message` recibe `{groupId,userId,message,date}`.
  - Mensajes emitidos normalizados con `groupId` en salida.
- Front chat:
  - Nuevo modelo `GroupChatMessages`.
  - `chat.service.ts` ahora mantiene caché global por grupo (`Map<groupId, messages>`).
  - `chat.component` muestra selector de grupos disponibles (no pending), cambia de chat y refresca historial por grupo.
  - Ajustes UI para selector y metadatos de tiempo en mensajes.
- Testing:
  - Añadidos tests backend:
    - `src/core/middlewares/auth.middleware.spec.ts`
    - `src/chat/chat.gateway.spec.ts`
  - `package.json` backend: añadido `moduleNameMapper` para alias `src/*` en Jest.

## Deviations
- No se cambió persistencia DB de chat (`chatId`) para mantener compatibilidad Prisma; se normaliza a `groupId` solo en capa socket/frontend.

## Notes
- No se ejecutó build de producción por política del repo; solo checks dev y tests.

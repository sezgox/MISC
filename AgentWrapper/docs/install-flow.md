# Flujo guiado de instalación / login de agentes

No hay "documento de instalación" estático: todo es un **wizard dentro de la app** que ejecuta comandos en el host remoto y reacciona a la salida.

## Pantallas

1. **Selección de agente** — cards de los `AgentAdapter` registrados.
2. **Detección** — `adapter.detect(session)` en el host elegido. Muestra:
   - "no instalado",
   - "instalado, versión X" (puedes saltarte instalación e ir a verificación),
   - "instalado pero login expirado".
3. **Ejecución** — la UI consume `adapter.install(session)` (stream) y por cada `AgentInstallStep`:
   - **command**: pinta el comando, abre un `LogBlock` y va anexando `outputChunk`.
   - **loginUrl**: salta a la pantalla de captura de URL.
   - **verification**: ejecuta el `verifyLoginCommand`.
   - **failed**: corta la cadena y muestra el error.
4. **Captura de URL de login** — tarjeta con:
   - URL seleccionable,
   - botón "Copiar",
   - botón "Abrir en navegador" (`url_launcher`),
   - QR (`qr_flutter`) para escanearlo desde un PC,
   - mensaje claro: "completa el login en el navegador y vuelve aquí".
5. **Verificación** — polling/retry del `verifyLoginCommand` cada N segundos con backoff. Cuando exit code = 0, persiste `agent_installations.status = ready`.
6. **Listo** — vuelta al detalle del host con el agente marcado como disponible.

## Captura de URL

Los CLIs imprimen la URL de OAuth en formatos variados (texto plano, recuadrada en cajas Unicode, prefijada con flechas). `LoginUrlCapture.firstUrl` aplica una heurística:

- regex que excluye caracteres de cajas Unicode y comillas/paréntesis,
- prioriza URLs con palabras clave (`login`, `auth`, `signin`, `device`, `oauth`, `callback`),
- si ninguna marca, devuelve la primera URL plausible.

Las heurísticas viven en `lib/services/agents_transport/url_capture.dart` y son fáciles de afinar por agente.

## Confirmaciones de seguridad

Antes de ejecutar un comando de instalación, mostrar el comando completo y pedir confirmación si contiene patrones sensibles (`sudo`, `curl ... | sh`, etc.). Lista configurable en futuro `core/security/dangerous_commands.dart`.

## Persistencia

Al completar:

```sql
INSERT INTO agent_installations (host_id, agent_kind, status, version, installed_at)
VALUES (?, ?, 'ready', ?, now());
```

Si falla el login: `status = 'failed'`, conservar el último error en `metadata_json` para el reintento.

# Abstracción de agentes CLI

Toda integración con un CLI (Codex, Cursor, Claude, …) pasa por **un solo contrato**: `AgentAdapter`.

```dart
abstract class AgentAdapter {
  AgentKind get kind;
  String get displayName;
  String get tagline;
  List<AgentCapability> get capabilities;

  Future<AgentDetection> detect(SshSession session);
  Stream<AgentInstallStep> install(SshSession session);

  Future<AgentRunHandle> startRepl(SshSession session, {String? projectPath});
  Stream<AgentEvent> events(AgentRunHandle handle);
  Future<void> send(AgentRunHandle handle, String prompt);
  Future<void> stop(AgentRunHandle handle);

  String buildHandoffPrompt(HandoffContext ctx);
}
```

## Eventos estructurados

`AgentEvent` es un `sealed class` con variantes:

- `TextDelta` — token streaming.
- `CodeBlockEvent` — bloque de código completo.
- `DiffBlockEvent` — diff unificado.
- `LogLineEvent` — línea de log con nivel.
- `LoginUrlDetected` — URL OAuth a abrir.
- `NeedsInputEvent` — el agente espera respuesta del usuario.
- `CompletedEvent` / `FailedEvent` — fin de turno.

La UI consume el stream y selecciona el widget del design system adecuado (`ChatBubble` + `CodeBlock`/`DiffBlock`/`LogBlock`/etc.).

## Cómo añadir un nuevo agente

1. **Enum**: añadir un valor a `AgentKind` (`lib/features/agents/domain/agent_kind.dart`).
2. **Adapter**: crear `lib/features/agents/data/adapters/<nombre>_agent_adapter.dart` extendiendo `BaseCliAgentAdapter`.
   - Define `binary`, `installCommands`, `verifyLoginCommand`, `capabilities`.
   - Sobrescribe `buildHandoffPrompt` con el formato preferido por el modelo.
   - Si necesitas parsing especial, sobrescribe `events` y reutiliza `BlockParser`.
3. **Registro**: añadirlo a la lista en `core/di/providers.dart` → `agentRegistryProvider`.
4. **Wizard**: ya lo recoge automáticamente; sólo asegúrate de que `_taglineFor` cubre el nuevo caso si quieres descripción extra.
5. **Color de marca**: ajustar `AgentChip._color` para el nuevo `AgentKind`.
6. **Tests**: añadir un test de `buildHandoffPrompt` en `test/unit/handoff_prompt_builder_test.dart`.

## Decisión: el destino formatea el handoff

El **adapter destino** decide cómo se le presenta el contexto cuando recibe un handoff. Esto reconoce que cada modelo responde mejor a una framing distinta (XML para Claude, markdown para Codex, etc.). El emisor solo aporta los datos crudos en `HandoffContext`.

## Trampa común

`startRepl` debe abrir un **shell con PTY** (`session.shell()`), no `exec`. Los REPL interactivos asumen TTY para colorear, pintar prompts y aceptar input línea a línea.

# AgentWrapper

Cliente móvil premium (Android + iOS) para conectarse por SSH a un servidor y operar **agentes CLI remotos** (Codex, Cursor, Claude, …) con una experiencia tipo chat + terminal bien renderizada.

> Estado: **bootstrap**. La app navega y muestra la UI base con datos mock; el SSH real, los REPL de los agentes y la persistencia con Drift quedan como esqueletos con `TODO`s claros.

## Visión

- Conectar por SSH a una o varias máquinas remotas, con credenciales en almacenamiento seguro.
- Detectar e **instalar guiadamente** agentes CLI compatibles, capturando URLs de login OAuth y mostrándolas al usuario.
- Conversar con el agente en una **UI premium**: chat con bloques de código, diffs, logs y una pestaña de terminal real (`xterm.dart`).
- Cambiar de agente sin perder el contexto, con un **prompt de handoff** generado por la app.
- Persistir máquinas, proyectos y sesiones localmente con Drift; secretos solo en `flutter_secure_storage`.

## Stack

- **Flutter 3.x** (Dart 3, canal stable) — render nativo, único codebase iOS/Android.
- **Riverpod 2** — state management con codegen.
- **go_router** — navegación declarativa.
- **dartssh2** — SSH puro Dart (PTY, exec, port forwarding).
- **xterm** — terminal con render nativo.
- **Drift** — SQLite tipado para persistencia local.
- **flutter_secure_storage** — Keychain (iOS) / Keystore (Android).
- **very_good_analysis** — lint estricto.

Razonamiento detallado en el plan asociado y en [docs/architecture.md](docs/architecture.md).

## Cómo arrancar (Windows)

> Requisitos: Flutter 3.22+, Android SDK 34+ instalado vía Android Studio o `flutter doctor`.

```bash
# 1) Instalar Flutter (https://docs.flutter.dev/get-started/install/windows)
flutter --version

# 2) Generar las carpetas de plataforma (este repo no las versiona)
cd AgentWrapper
flutter create . --org com.misc --project-name agent_wrapper --platforms=android,ios

# 3) Resolver dependencias
flutter pub get

# 4) (Opcional) Generar código de Drift y futuros freezed/Riverpod generators
dart run build_runner build --delete-conflicting-outputs

# 5) Lanzar en emulador / dispositivo Android
flutter run -d <device>
```

### iOS desde Windows

No se puede compilar iOS localmente sin Mac. Usaremos **Codemagic**: ver [codemagic.yaml](codemagic.yaml). El primer build pedirá certificados/perfiles de provisioning manualmente.

## Estructura

```text
lib/
  main.dart        # entrypoint
  app.dart         # MaterialApp.router + tema
  core/            # theme, router, DI, errores, utils, widgets compartidos
  features/        # connections, session, agents, projects, skills_mcp, settings, onboarding
  services/        # ssh, terminal, persistence (Drift), secure_storage, agents_transport
  design_system/   # tokens y widgets base (ChatBubble, CodeBlock, DiffBlock, LogBlock, AppTerminalView)
test/              # unit/, widget/
docs/              # architecture, agent-abstraction, install-flow, handoff-design, data-model
```

Detalle en [docs/architecture.md](docs/architecture.md).

## Documentos clave

- [docs/architecture.md](docs/architecture.md) — capas, dependencias, decisiones.
- [docs/agent-abstraction.md](docs/agent-abstraction.md) — cómo añadir un nuevo agente CLI.
- [docs/install-flow.md](docs/install-flow.md) — flujo guiado de instalación / login.
- [docs/handoff-design.md](docs/handoff-design.md) — sistema de cambio de agente sin perder contexto.
- [docs/data-model.md](docs/data-model.md) — tablas Drift y secretos.

## Roadmap corto

1. Cablear `dartssh2` real en `SshService` + `KnownHostsStore` con TOFU.
2. Implementar `BaseCliAgentAdapter.startRepl/events/send/stop` con `BlockParser`.
3. Drift wired en producción (`open_database.dart`) + DAOs.
4. Pantallas leyendo datos reales (eliminar mocks).
5. CI Codemagic verde con build iOS firmado.
6. Tests de integración del flujo "instalar Codex → enviar prompt → recibir diff".

## Contribuir

- Cumplir `analysis_options.yaml` (`very_good_analysis` con `strict-*` activado).
- No mezclar capas: la `presentation/` solo habla con use cases o providers, nunca con `dartssh2`/Drift directamente.
- No commitear secretos. La DB referencia `credentialRef`s; los valores viven en `flutter_secure_storage`.
- Cambios en agentes nuevos: ver [docs/agent-abstraction.md](docs/agent-abstraction.md).

## Licencia

Privado. Ver root del monorepo MISC.

# AgentWrapper — guía para agentes IA

Esta app es un **cliente móvil Flutter** para usar agentes CLI remotos por SSH desde el móvil. Está en fase **bootstrap**: la base, los contratos y las pantallas mock están en el repo; las integraciones reales son TODO con marcadores explícitos.

## Reglas de oro

1. **Capas**: `presentation/` no importa `dartssh2` ni Drift directamente. Hablar con el dominio o con providers de Riverpod.
2. **Secretos**: jamás escribirlos en la base de datos ni en logs. Usar `SecretsRepository` (`flutter_secure_storage`).
3. **Agentes nuevos**: añadir un valor a `AgentKind`, implementar `AgentAdapter` (o subclasear `BaseCliAgentAdapter`) y registrarlo en `core/di/providers.dart`. Ver [docs/agent-abstraction.md](docs/agent-abstraction.md).
4. **Lint**: respetar `very_good_analysis` con `strict-casts`/`strict-inference`/`strict-raw-types`. Sin `dynamic` en interfaces.
5. **No regenerar plataforma**: las carpetas `android/` y `ios/` se generan localmente con `flutter create . --org com.misc`. No commitear todo su contenido sin filtrar (ver `.gitignore`).
6. **Sincronización con el monorepo**: si se cambian convenciones que aplican a otras apps, revisar `../AGENTS.md` y avisar.

## Decisiones ya tomadas (no revisar sin justificación)

- Stack: Flutter + Riverpod + go_router + Drift + dartssh2 + xterm.
- SSH **directo** desde el móvil al servidor (sin relay).
- Builds iOS desde Windows vía **Codemagic**.
- Tema **dark-first** con tokens en `lib/design_system/tokens.dart`.

## Tareas típicas

- "Implementar `SshService.connect` real": ver `lib/services/ssh/ssh_service.dart` + TODO.
- "Cablear el wizard de instalación de Codex": ver `lib/features/agents/data/adapters/codex_agent_adapter.dart` y `lib/features/agents/presentation/install_flow/agent_install_wizard_screen.dart`.
- "Persistir hosts": completar Drift + DAOs en `lib/services/persistence/`.

## Skills instaladas (autoskills)

Tras la inicialización ejecutamos `npx autoskills -y -a cursor` y se instalaron en `.agents/skills/`:

- `kevmoo/dart-best-practices` — buenas prácticas Dart 3.
- `jeffallan/flutter-expert` — Riverpod, go_router, project structure, performance.
- `madteacher/flutter-animations` — animaciones explícitas, implícitas, hero, staggered.
- `madteacher/flutter-testing` — unit, widget, integration, mocking, plugins.

El lockfile vive en `skills-lock.json`. Para refrescarlas: `npx autoskills -y -a cursor`.

### Skills aún sin cubrir (candidatos a curar manualmente)

El producto necesita además guidelines específicas de:

- SSH / session management con `dartssh2` (PTY, reconexión, keepalive).
- Parsing/render de terminal (`xterm.dart`, ANSI, bloques, diffs).
- Integración multiagente y diseño de adapters CLI.
- Handoff de contexto entre LLMs/agentes.
- Almacenamiento seguro en móvil (Keychain/Keystore).
- Accesibilidad móvil (targets 44pt, contraste, Dynamic Type).
- Drift / migraciones SQLite.

Crear estos como skills locales en `.agents/skills/<slug>/SKILL.md` cuando los flujos correspondientes se estabilicen.

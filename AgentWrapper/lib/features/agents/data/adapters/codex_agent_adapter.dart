import '../../domain/agent_capability.dart';
import '../../domain/agent_kind.dart';
import '../../domain/handoff_context.dart';
import 'base_cli_agent_adapter.dart';

/// Adapter for the Codex CLI.
///
/// Install commands are intentionally declarative so the wizard can render
/// them. The exact commands are placeholders to be confirmed against the
/// official docs at integration time.
class CodexAgentAdapter extends BaseCliAgentAdapter {
  @override
  AgentKind get kind => AgentKind.codex;

  @override
  String get displayName => 'Codex';

  @override
  String get tagline => 'Agente CLI de OpenAI para tu repo';

  @override
  List<AgentCapability> get capabilities => const [
        AgentCapability.chat,
        AgentCapability.codeBlocks,
        AgentCapability.diffs,
        AgentCapability.shellExecution,
        AgentCapability.modes,
      ];

  @override
  String get binary => 'codex';

  @override
  List<({String title, String command})> get installCommands => const [
        // TODO(codex): replace with the official one-liner once documented.
        (title: 'Instalar Codex CLI', command: 'npm i -g @openai/codex'),
        (title: 'Iniciar login', command: 'codex login'),
      ];

  @override
  String get verifyLoginCommand => 'codex whoami';

  @override
  String buildHandoffPrompt(HandoffContext ctx) {
    final files = ctx.openFiles.isEmpty
        ? '(ninguno)'
        : ctx.openFiles.map((f) => '- $f').join('\n');
    final tasks = ctx.pendingTasks.isEmpty
        ? '(ninguno)'
        : ctx.pendingTasks.map((t) => '- $t').join('\n');
    final history = ctx.recentMessages
        .map((m) => '${m.role.toUpperCase()}: ${m.content}')
        .join('\n\n');

    return '''
# Handoff desde ${ctx.fromAgent.id} a ${ctx.toAgent.id}

Tomas el relevo en una sesi\u00f3n existente. Mant\u00e9n el tono y el plan.

## Proyecto
${ctx.projectPath ?? '(sin proyecto)'}

## Resumen
${ctx.summary}

## Archivos relevantes
$files

## Tareas pendientes
$tasks

## \u00daltimos mensajes
$history

Contin\u00faa desde aqu\u00ed.
''';
  }
}

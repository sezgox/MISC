import '../../domain/agent_capability.dart';
import '../../domain/agent_kind.dart';
import '../../domain/handoff_context.dart';
import 'base_cli_agent_adapter.dart';

class CursorAgentAdapter extends BaseCliAgentAdapter {
  @override
  AgentKind get kind => AgentKind.cursor;

  @override
  String get displayName => 'Cursor';

  @override
  String get tagline => 'Cursor CLI agente sobre tu workspace';

  @override
  List<AgentCapability> get capabilities => const [
        AgentCapability.chat,
        AgentCapability.codeBlocks,
        AgentCapability.diffs,
        AgentCapability.fileWrites,
        AgentCapability.shellExecution,
        AgentCapability.skills,
        AgentCapability.mcps,
        AgentCapability.modes,
      ];

  @override
  String get binary => 'cursor-agent';

  @override
  List<({String title, String command})> get installCommands => const [
        // TODO(cursor): confirmar comando oficial de instalaci\u00f3n del CLI.
        (
          title: 'Instalar Cursor CLI',
          command: 'curl -fsSL https://cursor.sh/install.sh | sh',
        ),
        (title: 'Iniciar login', command: 'cursor-agent login'),
      ];

  @override
  String get verifyLoginCommand => 'cursor-agent status';

  @override
  String buildHandoffPrompt(HandoffContext ctx) {
    return '''
[CONTEXT_HANDOFF from=${ctx.fromAgent.id} to=${ctx.toAgent.id}]
project: ${ctx.projectPath ?? '-'}
summary: ${ctx.summary}
open_files: ${ctx.openFiles.join(', ')}
pending_tasks:
${ctx.pendingTasks.map((t) => '  - $t').join('\n')}

recent_messages:
${ctx.recentMessages.map((m) => '  ${m.role}: ${m.content}').join('\n')}
[/CONTEXT_HANDOFF]

Contin\u00faa la sesi\u00f3n a partir de este contexto.
''';
  }
}

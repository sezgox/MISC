import '../../domain/agent_capability.dart';
import '../../domain/agent_kind.dart';
import '../../domain/handoff_context.dart';
import 'base_cli_agent_adapter.dart';

class ClaudeAgentAdapter extends BaseCliAgentAdapter {
  @override
  AgentKind get kind => AgentKind.claude;

  @override
  String get displayName => 'Claude';

  @override
  String get tagline => 'Claude Code CLI para trabajar en tu proyecto';

  @override
  List<AgentCapability> get capabilities => const [
        AgentCapability.chat,
        AgentCapability.codeBlocks,
        AgentCapability.diffs,
        AgentCapability.fileWrites,
        AgentCapability.shellExecution,
        AgentCapability.mcps,
        AgentCapability.modes,
      ];

  @override
  String get binary => 'claude';

  @override
  List<({String title, String command})> get installCommands => const [
        // TODO(claude): confirmar comando oficial.
        (title: 'Instalar Claude CLI', command: 'npm i -g @anthropic-ai/claude-code'),
        (title: 'Iniciar login', command: 'claude login'),
      ];

  @override
  String get verifyLoginCommand => 'claude --version';

  @override
  String buildHandoffPrompt(HandoffContext ctx) {
    final files = ctx.openFiles.map((f) => '<file>$f</file>').join('\n');
    final tasks = ctx.pendingTasks.map((t) => '<task>$t</task>').join('\n');
    final history = ctx.recentMessages
        .map((m) => '<message role="${m.role}">${m.content}</message>')
        .join('\n');

    return '''
<handoff from="${ctx.fromAgent.id}" to="${ctx.toAgent.id}">
  <project>${ctx.projectPath ?? ''}</project>
  <summary>${ctx.summary}</summary>
  <open_files>
$files
  </open_files>
  <pending_tasks>
$tasks
  </pending_tasks>
  <recent_messages>
$history
  </recent_messages>
</handoff>

Has recibido el contexto de la sesi\u00f3n previa. Contin\u00fa con el plan y mant\u00e9n el tono.
''';
  }
}

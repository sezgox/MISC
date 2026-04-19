import 'package:agent_wrapper/features/agents/data/adapters/claude_agent_adapter.dart';
import 'package:agent_wrapper/features/agents/data/adapters/codex_agent_adapter.dart';
import 'package:agent_wrapper/features/agents/data/adapters/cursor_agent_adapter.dart';
import 'package:agent_wrapper/features/agents/domain/agent_kind.dart';
import 'package:agent_wrapper/features/agents/domain/handoff_context.dart';
import 'package:agent_wrapper/services/agents_transport/handoff_prompt_builder.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const ctx = HandoffContext(
    fromAgent: AgentKind.codex,
    toAgent: AgentKind.claude,
    projectPath: '/srv/projects/api',
    summary: 'Refactoring user handlers to async.',
    recentMessages: [
      HandoffMessage(role: 'user', content: 'Make get_user async'),
      HandoffMessage(role: 'agent', content: 'Done, tests pass.'),
    ],
    openFiles: ['api/handlers/users.py'],
    pendingTasks: ['Migrate post_user'],
  );

  const builder = HandoffPromptBuilder();

  test('Claude adapter uses XML-tag framing', () {
    final p = builder.build(destination: ClaudeAgentAdapter(), context: ctx);
    expect(p, contains('<handoff'));
    expect(p, contains('<file>api/handlers/users.py</file>'));
    expect(p, contains('<task>Migrate post_user</task>'));
  });

  test('Codex adapter uses markdown framing', () {
    final p = builder.build(destination: CodexAgentAdapter(), context: ctx);
    expect(p, contains('# Handoff'));
    expect(p, contains('## Resumen'));
    expect(p, contains('## Tareas pendientes'));
  });

  test('Cursor adapter uses bracketed framing', () {
    final p = builder.build(destination: CursorAgentAdapter(), context: ctx);
    expect(p, contains('[CONTEXT_HANDOFF'));
    expect(p, contains('project: /srv/projects/api'));
  });
}

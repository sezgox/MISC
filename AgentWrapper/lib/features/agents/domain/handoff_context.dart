import 'agent_kind.dart';

/// Snapshot of conversation state used to brief a new agent when the user
/// switches mid-session. Lives in the *app*, not in the agent, so we keep
/// continuity across CLIs.
class HandoffContext {
  const HandoffContext({
    required this.fromAgent,
    required this.toAgent,
    required this.projectPath,
    required this.summary,
    required this.recentMessages,
    this.openFiles = const [],
    this.pendingTasks = const [],
  });

  final AgentKind fromAgent;
  final AgentKind toAgent;
  final String? projectPath;

  /// Human-readable summary of what has been discussed/decided so far.
  final String summary;

  /// Last N user/agent messages, oldest first, kept short.
  final List<HandoffMessage> recentMessages;

  /// Files the user is "actively" working on (last touched in chat).
  final List<String> openFiles;

  /// Tasks the previous agent left pending.
  final List<String> pendingTasks;
}

class HandoffMessage {
  const HandoffMessage({required this.role, required this.content});
  final String role; // 'user' | 'agent' | 'system'
  final String content;
}

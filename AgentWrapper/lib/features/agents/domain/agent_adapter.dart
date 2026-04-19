import '../../../services/ssh/ssh_session.dart';
import 'agent_capability.dart';
import 'agent_detection.dart';
import 'agent_event.dart';
import 'agent_install_step.dart';
import 'agent_kind.dart';
import 'agent_run_handle.dart';
import 'handoff_context.dart';

/// The single extension point for supporting a new CLI agent.
///
/// Adding a new agent means:
///   1. Add a value to [AgentKind].
///   2. Implement [AgentAdapter] for it.
///   3. Register the adapter in `core/di/providers.dart`.
///
/// The rest of the app talks only to this interface.
abstract class AgentAdapter {
  AgentKind get kind;
  String get displayName;
  String get tagline;
  List<AgentCapability> get capabilities;

  /// Probe the remote host for the CLI (presence + version).
  Future<AgentDetection> detect(SshSession session);

  /// Drive the guided install/login flow. The stream emits one
  /// [AgentInstallStep] per stage and completes when done (or with a step of
  /// kind [AgentInstallStepKind.failed]).
  Stream<AgentInstallStep> install(SshSession session);

  /// Start an interactive REPL of the agent in the given (optional) project.
  Future<AgentRunHandle> startRepl(
    SshSession session, {
    String? projectPath,
  });

  /// Stream of structured events for a running REPL.
  Stream<AgentEvent> events(AgentRunHandle handle);

  /// Send a user prompt to the running REPL.
  Future<void> send(AgentRunHandle handle, String prompt);

  /// Tear down the REPL.
  Future<void> stop(AgentRunHandle handle);

  /// Build a handoff prompt formatted in the way *this* agent prefers.
  /// Different agents respond better to different framings (XML tags,
  /// markdown sections, pseudo-JSON, etc.).
  String buildHandoffPrompt(HandoffContext ctx);
}

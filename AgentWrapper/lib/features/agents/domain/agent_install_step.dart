/// One step in the guided install/configuration flow of an agent.
///
/// The wizard renders steps in order, streams output, and reacts to
/// [AgentInstallStepKind.loginUrl] by surfacing the URL to the user.
class AgentInstallStep {
  const AgentInstallStep({
    required this.id,
    required this.title,
    required this.kind,
    this.command,
    this.outputChunk,
    this.loginUrl,
    this.isFinal = false,
    this.error,
  });

  final String id;
  final String title;
  final AgentInstallStepKind kind;

  /// The command that will be (or was) executed remotely. Null for steps that
  /// don't run a command (e.g. waiting on user login).
  final String? command;

  /// Latest streaming chunk of output for this step. Repeatedly emitted as
  /// data arrives so the UI can render a live log.
  final String? outputChunk;

  /// When [kind] is [AgentInstallStepKind.loginUrl], the URL the user must
  /// open in a browser to complete authentication.
  final String? loginUrl;

  /// Marks the last step of the install stream.
  final bool isFinal;

  /// Non-null when the step failed.
  final String? error;
}

enum AgentInstallStepKind {
  command,
  loginUrl,
  waitingForUser,
  verification,
  done,
  failed,
}

/// Discriminated union of events emitted by a running agent REPL.
///
/// Adapters parse the raw stdout/stderr of their CLI and translate it into
/// these structured events; the UI then renders blocks accordingly.
sealed class AgentEvent {
  const AgentEvent();
}

/// A streamed delta of plain text (token-like output).
class TextDelta extends AgentEvent {
  const TextDelta(this.text);
  final String text;
}

/// A complete code block with optional language fence.
class CodeBlockEvent extends AgentEvent {
  const CodeBlockEvent({required this.code, this.language});
  final String code;
  final String? language;
}

/// A complete unified diff block.
class DiffBlockEvent extends AgentEvent {
  const DiffBlockEvent({required this.unifiedDiff, this.path});
  final String unifiedDiff;
  final String? path;
}

/// A single line of structured log output.
class LogLineEvent extends AgentEvent {
  const LogLineEvent({required this.line, this.level = 'info'});
  final String line;
  final String level;
}

/// The agent printed an authentication URL the user must open.
class LoginUrlDetected extends AgentEvent {
  const LoginUrlDetected(this.url);
  final String url;
}

/// The agent is asking for input (e.g. confirmation y/n).
class NeedsInputEvent extends AgentEvent {
  const NeedsInputEvent({required this.prompt, this.kind = 'text'});
  final String prompt;
  final String kind;
}

/// The agent finished its turn cleanly.
class CompletedEvent extends AgentEvent {
  const CompletedEvent();
}

/// The agent failed; [message] is human-readable.
class FailedEvent extends AgentEvent {
  const FailedEvent(this.message, {this.cause});
  final String message;
  final Object? cause;
}

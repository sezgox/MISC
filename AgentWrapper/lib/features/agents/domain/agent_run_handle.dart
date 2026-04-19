/// Opaque handle for a running agent REPL. Adapters return their own subtype
/// (e.g. wrapping the underlying SSH PTY); the rest of the app only sees the
/// handle as a token to pass back to `send`/`stop`/`events`.
abstract class AgentRunHandle {
  String get id;
  bool get isAlive;
}

import 'dart:async';

/// Abstract handle to an interactive SSH session against a remote host.
///
/// Concrete impls wrap `dartssh2` (`SSHClient` + `SSHSession`). We keep the
/// interface narrow on purpose so the rest of the app (especially adapters)
/// can be tested with fakes.
abstract class SshSession {
  String get hostId;
  bool get isConnected;

  /// Run a one-shot command and return its full stdout (and combined stderr
  /// in [stderr]). Suitable for short detection commands like `which codex`.
  Future<SshExecResult> exec(String command, {Duration? timeout});

  /// Open an interactive shell with a PTY. The returned [SshShell] streams
  /// stdout/stderr and accepts user input. Used to run agent REPLs.
  Future<SshShell> shell({
    String term = 'xterm-256color',
    int cols = 120,
    int rows = 40,
  });

  /// Emits when the underlying transport detects a disconnection. Listeners
  /// (e.g. UI) can surface reconnect affordances.
  Stream<void> get onDisconnected;

  Future<void> close();
}

class SshExecResult {
  const SshExecResult({
    required this.stdout,
    required this.stderr,
    required this.exitCode,
  });
  final String stdout;
  final String stderr;
  final int exitCode;

  bool get ok => exitCode == 0;
}

abstract class SshShell {
  /// Raw bytes from the remote PTY (stdout+stderr merged when pty is on).
  Stream<List<int>> get output;
  Future<void> write(String data);
  Future<void> resize(int cols, int rows);
  Future<void> close();
  bool get isClosed;
}

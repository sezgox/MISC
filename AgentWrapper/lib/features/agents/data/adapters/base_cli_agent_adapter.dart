import 'dart:async';
import 'dart:convert';

import '../../../../services/agents_transport/url_capture.dart';
import '../../../../services/ssh/ssh_session.dart';
import '../../../../services/terminal/ansi_sanitizer.dart';
import '../../../../services/terminal/block_parser.dart';
import '../../domain/agent_adapter.dart';
import '../../domain/agent_detection.dart';
import '../../domain/agent_event.dart';
import '../../domain/agent_install_step.dart';
import '../../domain/agent_run_handle.dart';

/// Shared behavior for CLI-based agents (which-style detection, command
/// streaming, login URL capture, PTY REPL). Concrete adapters declare a
/// small configuration table; this class does the orchestration.
abstract class BaseCliAgentAdapter implements AgentAdapter {
  /// Binary name used by `which` for detection (e.g. `codex`).
  String get binary;

  /// Argument(s) used to retrieve the version (e.g. `['--version']`).
  List<String> get versionArgs => const ['--version'];

  /// Ordered install/login commands to run on the remote host.
  /// Each entry maps a UI title to the actual shell command.
  List<({String title, String command})> get installCommands;

  /// Command used to verify that login was completed successfully (e.g.
  /// `codex whoami`). Should exit non-zero when not logged in.
  String get verifyLoginCommand;

  /// Extra env to export in the REPL (`TERM`, `LANG`, etc.).
  Map<String, String> get replEnvironment => const {
        'TERM': 'xterm-256color',
        'LANG': 'en_US.UTF-8',
        'LC_ALL': 'en_US.UTF-8',
        'NO_COLOR': '0',
      };

  /// Optional extra flags when launching the REPL. Adapters override to pass
  /// `--resume`, `--project`, etc.
  List<String> replExtraArgs({String? projectPath}) => const [];

  @override
  Future<AgentDetection> detect(SshSession session) async {
    final which = await session.exec(
      'command -v $binary || which $binary',
      timeout: const Duration(seconds: 8),
    );
    if (which.exitCode != 0 || which.stdout.trim().isEmpty) {
      return AgentDetection.notInstalled;
    }
    final path = which.stdout.trim().split('\n').first;
    String? version;
    try {
      final v = await session.exec(
        '$binary ${versionArgs.join(' ')}',
        timeout: const Duration(seconds: 8),
      );
      if (v.exitCode == 0) version = v.stdout.trim();
    } on Object {
      // best-effort
    }
    return AgentDetection(installed: true, path: path, version: version);
  }

  @override
  Stream<AgentInstallStep> install(SshSession session) async* {
    var index = 0;
    for (final step in installCommands) {
      final id = 'step_${index++}';
      yield AgentInstallStep(
        id: id,
        title: step.title,
        kind: AgentInstallStepKind.command,
        command: step.command,
      );
      try {
        final result = await session.exec(
          step.command,
          timeout: const Duration(minutes: 8),
        );
        yield AgentInstallStep(
          id: id,
          title: step.title,
          kind: AgentInstallStepKind.command,
          command: step.command,
          outputChunk: result.stdout +
              (result.stderr.isNotEmpty ? '\n${result.stderr}' : ''),
        );
        final url = LoginUrlCapture.firstUrl(result.stdout + result.stderr);
        if (url != null) {
          yield AgentInstallStep(
            id: '${id}_login',
            title: 'Completar login en el navegador',
            kind: AgentInstallStepKind.loginUrl,
            loginUrl: url,
          );
        }
      } on Object catch (e) {
        yield AgentInstallStep(
          id: id,
          title: step.title,
          kind: AgentInstallStepKind.failed,
          command: step.command,
          error: e.toString(),
          isFinal: true,
        );
        return;
      }
    }
    yield AgentInstallStep(
      id: 'verify',
      title: 'Verificar autenticaci\u00f3n',
      kind: AgentInstallStepKind.verification,
      command: verifyLoginCommand,
    );
    final verify = await session.exec(verifyLoginCommand);
    if (verify.exitCode != 0) {
      yield AgentInstallStep(
        id: 'verify',
        title: 'Verificar autenticaci\u00f3n',
        kind: AgentInstallStepKind.failed,
        command: verifyLoginCommand,
        error: verify.stderr.isNotEmpty
            ? verify.stderr
            : 'exit ${verify.exitCode}',
        isFinal: true,
      );
      return;
    }
    yield const AgentInstallStep(
      id: 'done',
      title: 'Listo',
      kind: AgentInstallStepKind.done,
      isFinal: true,
    );
  }

  @override
  Future<AgentRunHandle> startRepl(
    SshSession session, {
    String? projectPath,
  }) async {
    final shell = await session.shell();
    final handle = CliAgentRunHandle._(shell: shell);

    // Tell the shell to be quiet/predictable and boot the agent.
    final envLine = replEnvironment.entries
        .map((e) => 'export ${e.key}=${_shellQuote(e.value)}')
        .join('; ');
    final cdLine = projectPath == null || projectPath.isEmpty
        ? ''
        : 'cd ${_shellQuote(projectPath)} && ';
    final extra = replExtraArgs(projectPath: projectPath).join(' ');
    final boot = '$envLine; $cdLine$binary${extra.isEmpty ? '' : ' $extra'}\n';
    await shell.write(boot);
    return handle;
  }

  @override
  Stream<AgentEvent> events(AgentRunHandle handle) {
    final h = _expect(handle);
    return h._events.stream;
  }

  @override
  Future<void> send(AgentRunHandle handle, String prompt) async {
    final h = _expect(handle);
    // Most CLI agents treat a blank line as "submit". We append \n but leave
    // any internal newlines untouched.
    await h.shell.write('$prompt\n');
  }

  @override
  Future<void> stop(AgentRunHandle handle) async {
    final h = _expect(handle);
    await h.dispose();
  }

  CliAgentRunHandle _expect(AgentRunHandle handle) {
    if (handle is! CliAgentRunHandle) {
      throw ArgumentError('handle is not a CliAgentRunHandle');
    }
    return handle;
  }

  String _shellQuote(String s) {
    if (s.isEmpty) return "''";
    if (RegExp(r'^[A-Za-z0-9_\-./:=]+$').hasMatch(s)) return s;
    return "'${s.replaceAll("'", "'\\''")}'";
  }
}

/// Concrete handle that owns the PTY shell + a live [AgentEvent] stream.
class CliAgentRunHandle implements AgentRunHandle {
  CliAgentRunHandle._({required this.shell})
      : _events = StreamController<AgentEvent>() {
    _parser = BlockParser();
    _outputSub = shell.output.listen(
      _onBytes,
      onDone: () {
        if (!_events.isClosed) {
          _events.add(const CompletedEvent());
          _events.close();
        }
        _alive = false;
      },
      onError: (Object e, StackTrace st) {
        if (!_events.isClosed) {
          _events.add(FailedEvent(e.toString(), cause: e));
        }
      },
    );
  }

  @override
  String get id => 'cli_${shell.hashCode}';

  bool _alive = true;
  @override
  bool get isAlive => _alive && !shell.isClosed;

  final SshShell shell;
  final StreamController<AgentEvent> _events;
  late final BlockParser _parser;
  late final StreamSubscription<List<int>> _outputSub;

  /// Raw, unparsed byte stream — kept so the Terminal tab can show the exact
  /// PTY output (colors, ANSI, spinners) while the chat tab shows structured
  /// blocks.
  Stream<List<int>> get rawBytes => shell.output;

  void _onBytes(List<int> chunk) {
    final text = utf8.decode(chunk, allowMalformed: true);
    final plain = AnsiSanitizer.strip(text);
    for (final e in _parser.consume(plain)) {
      if (!_events.isClosed) _events.add(e);
    }
  }

  Future<void> dispose() async {
    _alive = false;
    await _outputSub.cancel();
    if (!shell.isClosed) await shell.close();
    if (!_events.isClosed) await _events.close();
  }
}

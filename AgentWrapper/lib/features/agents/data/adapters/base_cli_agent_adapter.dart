import 'dart:async';

import '../../../../services/agents_transport/url_capture.dart';
import '../../../../services/ssh/ssh_session.dart';
import '../../domain/agent_adapter.dart';
import '../../domain/agent_detection.dart';
import '../../domain/agent_event.dart';
import '../../domain/agent_install_step.dart';
import '../../domain/agent_run_handle.dart';

/// Shared behavior for CLI-based agents (which-style detection, command
/// streaming, login URL capture). Concrete adapters declare a small
/// configuration table; this class does the orchestration.
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

  @override
  Future<AgentDetection> detect(SshSession session) async {
    final which = await session.exec('command -v $binary || which $binary');
    if (which.exitCode != 0 || which.stdout.trim().isEmpty) {
      return AgentDetection.notInstalled;
    }
    final path = which.stdout.trim().split('\n').first;
    String? version;
    try {
      final v = await session.exec('$binary ${versionArgs.join(' ')}');
      if (v.exitCode == 0) version = v.stdout.trim();
    } on Object {
      // Version probing is best-effort; ignore failures.
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
        final result = await session.exec(step.command);
        // Forward output as a chunk so the UI can render the live log.
        yield AgentInstallStep(
          id: id,
          title: step.title,
          kind: AgentInstallStepKind.command,
          command: step.command,
          outputChunk: result.stdout + (result.stderr.isNotEmpty ? '\n${result.stderr}' : ''),
        );
        // Detect any login URL in the combined output.
        final url = LoginUrlCapture.firstUrl(
          result.stdout + result.stderr,
        );
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
        error: verify.stderr.isNotEmpty ? verify.stderr : 'exit ${verify.exitCode}',
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
  Future<AgentRunHandle> startRepl(SshSession session, {String? projectPath}) {
    // TODO(adapters): open shell, cd to projectPath, exec `binary` interactively
    // and return a handle wrapping the SshShell + an AgentEvent stream.
    throw UnimplementedError('startRepl for $displayName');
  }

  @override
  Stream<AgentEvent> events(AgentRunHandle handle) {
    // TODO(adapters): convert raw shell stdout into structured events using
    // `services/terminal/block_parser.dart` + per-agent heuristics.
    throw UnimplementedError('events for $displayName');
  }

  @override
  Future<void> send(AgentRunHandle handle, String prompt) {
    throw UnimplementedError('send for $displayName');
  }

  @override
  Future<void> stop(AgentRunHandle handle) {
    throw UnimplementedError('stop for $displayName');
  }
}

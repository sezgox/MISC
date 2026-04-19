import 'dart:async';
import 'dart:convert';

import 'package:xterm/xterm.dart';

import '../ssh/ssh_session.dart';

/// Bridges an [SshShell] (raw bytes in/out) and an xterm [Terminal].
///
/// Created and owned by the session feature; disposed when the session view
/// is left so we don't leak the underlying SSH PTY.
class TerminalController {
  TerminalController({required this.shell})
      : terminal = Terminal(maxLines: 10000) {
    terminal.onOutput = (data) {
      shell.write(data);
    };
    terminal.onResize = (cols, rows, _, __) {
      shell.resize(cols, rows);
    };
    _subscription = shell.output.listen(
      (chunk) => terminal.write(utf8.decode(chunk, allowMalformed: true)),
      onDone: () => terminal.write('\r\n[connection closed]\r\n'),
    );
  }

  final SshShell shell;
  final Terminal terminal;
  StreamSubscription<List<int>>? _subscription;

  Future<void> dispose() async {
    await _subscription?.cancel();
    _subscription = null;
    if (!shell.isClosed) await shell.close();
  }
}

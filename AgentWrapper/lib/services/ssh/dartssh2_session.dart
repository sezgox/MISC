import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dartssh2/dartssh2.dart';

import '../../core/errors/failures.dart';
import 'ssh_session.dart';

/// Concrete [SshSession] backed by dartssh2's [SSHClient].
class DartSshSession implements SshSession {
  DartSshSession({
    required this.hostId,
    required SSHClient client,
  }) : _client = client {
    _client.done.whenComplete(() {
      if (!_disconnected.isClosed) _disconnected.add(null);
    });
  }

  @override
  final String hostId;

  final SSHClient _client;
  final StreamController<void> _disconnected = StreamController.broadcast();
  bool _closed = false;

  @override
  bool get isConnected => !_closed && !_client.isClosed;

  @override
  Stream<void> get onDisconnected => _disconnected.stream;

  @override
  Future<SshExecResult> exec(String command, {Duration? timeout}) async {
    if (!isConnected) {
      throw AppException(const SshFailure('session is closed'));
    }
    final op = () async {
      final session = await _client.execute(command);
      final outBuf = BytesBuilder(copy: false);
      final errBuf = BytesBuilder(copy: false);
      final outSub = session.stdout.listen(outBuf.add);
      final errSub = session.stderr.listen(errBuf.add);
      await session.done;
      await outSub.cancel();
      await errSub.cancel();
      return SshExecResult(
        stdout: utf8.decode(outBuf.takeBytes(), allowMalformed: true),
        stderr: utf8.decode(errBuf.takeBytes(), allowMalformed: true),
        exitCode: session.exitCode ?? -1,
      );
    };
    if (timeout == null) return op();
    return op().timeout(
      timeout,
      onTimeout: () => throw AppException(
        SshFailure('exec timed out after ${timeout.inMilliseconds}ms: $command'),
      ),
    );
  }

  @override
  Future<SshShell> shell({
    String term = 'xterm-256color',
    int cols = 120,
    int rows = 40,
  }) async {
    if (!isConnected) {
      throw AppException(const SshFailure('session is closed'));
    }
    final session = await _client.shell(
      pty: SSHPtyConfig(type: term, width: cols, height: rows),
    );
    return _DartSshShell(session);
  }

  @override
  Future<void> close() async {
    if (_closed) return;
    _closed = true;
    try {
      _client.close();
    } on Object {
      // best-effort close
    }
    if (!_disconnected.isClosed) {
      _disconnected.add(null);
      await _disconnected.close();
    }
  }
}

class _DartSshShell implements SshShell {
  _DartSshShell(this._session) {
    // Merge stdout+stderr into a single raw byte stream; a PTY usually merges
    // them on the remote side anyway but some servers still split, so we
    // defensively merge here too.
    _session.stdout.listen(_sink.add, onError: _sink.addError, onDone: _maybeClose);
    _session.stderr.listen(_sink.add, onError: _sink.addError, onDone: _maybeClose);
    _doneCount = 0;
  }

  final SSHSession _session;
  final StreamController<List<int>> _sink = StreamController<List<int>>.broadcast();
  int _doneCount = 0;
  bool _closed = false;

  void _maybeClose() {
    _doneCount++;
    if (_doneCount >= 2 && !_sink.isClosed) {
      _sink.close();
    }
  }

  @override
  bool get isClosed => _closed;

  @override
  Stream<List<int>> get output => _sink.stream;

  @override
  Future<void> write(String data) async {
    _session.write(Uint8List.fromList(utf8.encode(data)));
  }

  @override
  Future<void> resize(int cols, int rows) async {
    _session.resizeTerminal(cols, rows);
  }

  @override
  Future<void> close() async {
    if (_closed) return;
    _closed = true;
    try {
      _session.close();
    } on Object {
      // best-effort
    }
    if (!_sink.isClosed) await _sink.close();
  }
}

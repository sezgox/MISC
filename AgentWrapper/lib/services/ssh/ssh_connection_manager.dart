import 'dart:async';

import '../../core/errors/failures.dart';
import 'ssh_service.dart';
import 'ssh_session.dart';

/// Status of an ongoing / attempted SSH connection for a given host.
enum SshConnectionStatus { idle, connecting, connected, error }

class SshConnectionState {
  const SshConnectionState({
    required this.status,
    this.session,
    this.fingerprint,
    this.error,
  });

  final SshConnectionStatus status;
  final SshSession? session;
  final String? fingerprint;
  final String? error;

  static const SshConnectionState idle =
      SshConnectionState(status: SshConnectionStatus.idle);

  SshConnectionState copyWith({
    SshConnectionStatus? status,
    SshSession? session,
    String? fingerprint,
    String? error,
  }) =>
      SshConnectionState(
        status: status ?? this.status,
        session: session ?? this.session,
        fingerprint: fingerprint ?? this.fingerprint,
        error: error,
      );
}

/// Owns live [SshSession]s keyed by hostId. Multiple screens can watch
/// [stateFor] to know whether a host is connected, connecting, or errored.
///
/// Sessions are shared: calling [connect] twice for the same host returns the
/// existing session. Call [disconnect] explicitly to tear one down.
class SshConnectionManager {
  SshConnectionManager(this._service);
  final SshService _service;

  final Map<String, StreamController<SshConnectionState>> _controllers = {};
  final Map<String, SshConnectionState> _state = {};
  final Map<String, StreamSubscription<void>> _disconnectSubs = {};

  Stream<SshConnectionState> stateFor(String hostId) {
    final c = _controllers.putIfAbsent(
      hostId,
      () => StreamController<SshConnectionState>.broadcast(),
    );
    return c.stream;
  }

  SshConnectionState current(String hostId) =>
      _state[hostId] ?? SshConnectionState.idle;

  SshSession? sessionFor(String hostId) => _state[hostId]?.session;

  /// Connect (or reuse) an SSH session for [config.hostId].
  Future<SshSession> connect(SshConnectionConfig config) async {
    final existing = _state[config.hostId];
    if (existing?.status == SshConnectionStatus.connected &&
        existing?.session != null &&
        existing!.session!.isConnected) {
      return existing.session!;
    }
    _emit(config.hostId, const SshConnectionState(status: SshConnectionStatus.connecting));
    try {
      final out = await _service.connect(config);
      _disconnectSubs[config.hostId]?.cancel();
      _disconnectSubs[config.hostId] = out.session.onDisconnected.listen((_) {
        _emit(
          config.hostId,
          const SshConnectionState(status: SshConnectionStatus.idle),
        );
      });
      _emit(
        config.hostId,
        SshConnectionState(
          status: SshConnectionStatus.connected,
          session: out.session,
          fingerprint: out.fingerprint,
        ),
      );
      return out.session;
    } on AppException catch (e) {
      _emit(
        config.hostId,
        SshConnectionState(
          status: SshConnectionStatus.error,
          error: e.failure.message,
        ),
      );
      rethrow;
    } on Object catch (e) {
      _emit(
        config.hostId,
        SshConnectionState(
          status: SshConnectionStatus.error,
          error: e.toString(),
        ),
      );
      rethrow;
    }
  }

  Future<void> disconnect(String hostId) async {
    final st = _state[hostId];
    if (st?.session != null) await st!.session!.close();
    await _disconnectSubs.remove(hostId)?.cancel();
    _emit(hostId, SshConnectionState.idle);
  }

  Future<void> dispose() async {
    for (final s in _disconnectSubs.values) {
      await s.cancel();
    }
    _disconnectSubs.clear();
    for (final st in _state.values) {
      if (st.session != null) await st.session!.close();
    }
    _state.clear();
    for (final c in _controllers.values) {
      await c.close();
    }
    _controllers.clear();
  }

  void _emit(String hostId, SshConnectionState state) {
    _state[hostId] = state;
    _controllers[hostId]?.add(state);
  }
}

import 'dart:async';

import '../../core/errors/failures.dart';
import 'ssh_session.dart';

/// Connection parameters for a remote host. Sensitive material (passwords,
/// passphrases, private key contents) is referenced indirectly via
/// [credentialRef] which the caller resolves through [SecretsRepository].
class SshConnectionConfig {
  const SshConnectionConfig({
    required this.hostId,
    required this.host,
    required this.port,
    required this.username,
    required this.authKind,
    required this.credentialRef,
    this.knownHostFingerprint,
    this.keepAlive = const Duration(seconds: 30),
  });

  final String hostId;
  final String host;
  final int port;
  final String username;
  final SshAuthKind authKind;
  final String credentialRef;
  final String? knownHostFingerprint;
  final Duration keepAlive;
}

enum SshAuthKind { password, privateKey }

/// Facade over `dartssh2` that manages the lifecycle of [SshSession]s.
///
/// This class is intentionally a stub for the bootstrap phase: the real
/// implementation will:
///   * Resolve credentials from `SecretsRepository`.
///   * Verify host fingerprint against `KnownHostsStore` (TOFU + pinning).
///   * Apply keepalive + reconnection policies.
///   * Multiplex multiple sessions per host when needed.
class SshService {
  /// Open an interactive [SshSession] using the given config.
  Future<SshSession> connect(SshConnectionConfig config) async {
    // TODO(ssh): implement using package:dartssh2
    //   final client = SSHClient(
    //     await SSHSocket.connect(config.host, config.port),
    //     username: config.username,
    //     onPasswordRequest: () async => /* resolve via SecretsRepository */ '',
    //   );
    //   return _DartSshSessionAdapter(client, config.hostId);
    throw AppException(const SshFailure('SshService.connect not implemented'));
  }

  /// Quick "is the host reachable + can we authenticate" check used by the
  /// connection form to give immediate feedback before saving.
  Future<bool> testConnection(SshConnectionConfig config) async {
    try {
      final s = await connect(config);
      await s.close();
      return true;
    } on Object {
      return false;
    }
  }
}

import 'dart:async';
import 'dart:typed_data';

import 'package:dartssh2/dartssh2.dart';

import '../../core/errors/failures.dart';
import '../secure_storage/secrets_repository.dart';
import 'dartssh2_session.dart';
import 'known_hosts_store.dart';
import 'ssh_session.dart';

enum SshAuthKind { password, privateKey }

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
    this.passphraseRef,
    this.knownHostFingerprint,
    this.keepAlive = const Duration(seconds: 30),
    this.connectTimeout = const Duration(seconds: 12),
  });

  final String hostId;
  final String host;
  final int port;
  final String username;
  final SshAuthKind authKind;
  final String credentialRef;

  /// Optional reference to the passphrase secret (for encrypted private keys).
  final String? passphraseRef;
  final String? knownHostFingerprint;
  final Duration keepAlive;
  final Duration connectTimeout;
}

/// Result of validating a host fingerprint on connect.
class SshConnectOutcome {
  const SshConnectOutcome({required this.session, required this.fingerprint});
  final SshSession session;
  final String fingerprint;
}

/// Facade over `dartssh2` that manages the lifecycle of [SshSession]s.
class SshService {
  SshService({
    required SecretsRepository secrets,
    required KnownHostsStore knownHosts,
  })  : _secrets = secrets,
        _knownHosts = knownHosts;

  final SecretsRepository _secrets;
  final KnownHostsStore _knownHosts;

  /// Open an interactive [SshSession] using the given config.
  ///
  /// Fingerprint policy (TOFU):
  ///   - If [SshConnectionConfig.knownHostFingerprint] is null, we accept
  ///     whatever the remote host presents and return it via [SshConnectOutcome]
  ///     so the caller can persist it.
  ///   - Otherwise we require an exact match.
  Future<SshConnectOutcome> connect(SshConnectionConfig config) async {
    final secret = await _secrets.readSecret(config.credentialRef);
    if (secret == null || secret.isEmpty) {
      throw AppException(
        const AuthFailure('missing credential in secure storage'),
      );
    }
    final passphrase = config.passphraseRef == null
        ? null
        : await _secrets.readSecret(config.passphraseRef!);

    final pinned = config.knownHostFingerprint ??
        await _knownHosts.fingerprintFor(config.hostId);

    String? capturedFingerprint;
    late SSHSocket socket;
    try {
      socket = await SSHSocket.connect(
        config.host,
        config.port,
        timeout: config.connectTimeout,
      );
    } on Object catch (e) {
      throw AppException(NetworkFailure('cannot reach host: $e', cause: e));
    }

    final client = SSHClient(
      socket,
      username: config.username,
      onVerifyHostKey: (type, fingerprintBytes) {
        final fp = _fingerprintToString(type, fingerprintBytes);
        capturedFingerprint = fp;
        if (pinned == null) return true;
        return pinned == fp;
      },
      onPasswordRequest: config.authKind == SshAuthKind.password
          ? () async => secret
          : null,
      identities: config.authKind == SshAuthKind.privateKey
          ? _loadIdentities(secret, passphrase)
          : null,
      keepAliveInterval: config.keepAlive,
    );

    try {
      await client.authenticated.timeout(config.connectTimeout * 2);
    } on SSHAuthFailError catch (e) {
      client.close();
      throw AppException(AuthFailure('authentication failed', cause: e));
    } on SSHHostkeyError catch (e) {
      client.close();
      throw AppException(
        SshFailure(
          'host key verification failed (expected=$pinned got=$capturedFingerprint)',
          cause: e,
        ),
      );
    } on TimeoutException catch (e) {
      client.close();
      throw AppException(NetworkFailure('timeout while connecting', cause: e));
    } on Object catch (e) {
      client.close();
      throw AppException(SshFailure('ssh connect failed: $e', cause: e));
    }

    // Persist fingerprint on first successful connect.
    if (pinned == null && capturedFingerprint != null) {
      await _knownHosts.remember(config.hostId, capturedFingerprint!);
    }

    return SshConnectOutcome(
      session: DartSshSession(hostId: config.hostId, client: client),
      fingerprint: capturedFingerprint ?? pinned ?? '',
    );
  }

  /// Quick "is the host reachable + can we authenticate" check used by the
  /// connection form to give immediate feedback before saving.
  Future<SshProbeResult> testConnection(SshConnectionConfig config) async {
    try {
      final out = await connect(config);
      final whoami = await out.session.exec('whoami', timeout: const Duration(seconds: 6));
      await out.session.close();
      return SshProbeResult(
        ok: whoami.ok,
        fingerprint: out.fingerprint,
        whoami: whoami.stdout.trim(),
      );
    } on AppException catch (e) {
      return SshProbeResult(ok: false, error: e.failure.message);
    } on Object catch (e) {
      return SshProbeResult(ok: false, error: e.toString());
    }
  }

  List<SSHKeyPair> _loadIdentities(String pem, String? passphrase) {
    try {
      return SSHKeyPair.fromPem(pem, passphrase);
    } on Object catch (e) {
      throw AppException(AuthFailure('invalid private key: $e', cause: e));
    }
  }

  /// Builds a stable, human-friendly fingerprint string from the raw bytes
  /// dartssh2 hands us in [SSHHostkeyVerifyHandler]. Format: `md5:<hex>`.
  String _fingerprintToString(String type, Uint8List bytes) {
    final hex = bytes
        .map((b) => b.toRadixString(16).padLeft(2, '0'))
        .join(':');
    return '$type md5:$hex';
  }
}

class SshProbeResult {
  const SshProbeResult({
    required this.ok,
    this.fingerprint,
    this.whoami,
    this.error,
  });

  final bool ok;
  final String? fingerprint;
  final String? whoami;
  final String? error;
}

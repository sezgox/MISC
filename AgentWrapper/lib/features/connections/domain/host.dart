import '../../../services/ssh/ssh_service.dart';

/// Domain model for a remote host. Immutable. Passwords / private keys are
/// referenced indirectly through [credentialRef] (+ optional [passphraseRef]).
class Host {
  const Host({
    required this.id,
    required this.alias,
    required this.host,
    required this.port,
    required this.username,
    required this.authKind,
    required this.credentialRef,
    required this.createdAt,
    this.passphraseRef,
    this.knownHostFingerprint,
    this.lastUsedAt,
  });

  final String id;
  final String alias;
  final String host;
  final int port;
  final String username;
  final SshAuthKind authKind;
  final String credentialRef;
  final String? passphraseRef;
  final String? knownHostFingerprint;
  final DateTime createdAt;
  final DateTime? lastUsedAt;

  String get label => '$username@$host:$port';

  Host copyWith({
    String? knownHostFingerprint,
    DateTime? lastUsedAt,
    String? passphraseRef,
  }) =>
      Host(
        id: id,
        alias: alias,
        host: host,
        port: port,
        username: username,
        authKind: authKind,
        credentialRef: credentialRef,
        passphraseRef: passphraseRef ?? this.passphraseRef,
        knownHostFingerprint:
            knownHostFingerprint ?? this.knownHostFingerprint,
        createdAt: createdAt,
        lastUsedAt: lastUsedAt ?? this.lastUsedAt,
      );
}

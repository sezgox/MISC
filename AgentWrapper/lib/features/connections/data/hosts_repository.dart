import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../services/persistence/app_database.dart';
import '../../../services/secure_storage/secrets_repository.dart';
import '../../../services/ssh/ssh_service.dart';
import '../domain/host.dart';

/// CRUD for remote hosts + handles the lifecycle of their associated secrets
/// in secure storage. The database only stores opaque `credentialRef`s.
class HostsRepository {
  HostsRepository({required AppDatabase db, required SecretsRepository secrets})
      : _db = db,
        _secrets = secrets;

  final AppDatabase _db;
  final SecretsRepository _secrets;
  static const _uuid = Uuid();

  Stream<List<Host>> watchAll() {
    return _db.select(_db.remoteHosts).watch().map(
          (rows) => rows.map(_toDomain).toList(growable: false),
        );
  }

  Future<List<Host>> getAll() async {
    final rows = await _db.select(_db.remoteHosts).get();
    return rows.map(_toDomain).toList(growable: false);
  }

  Future<Host?> getById(String hostId) async {
    final row = await (_db.select(_db.remoteHosts)
          ..where((t) => t.id.equals(hostId)))
        .getSingleOrNull();
    return row == null ? null : _toDomain(row);
  }

  /// Create a new host and persist its secret in secure storage.
  Future<Host> create({
    required String alias,
    required String host,
    required int port,
    required String username,
    required SshAuthKind authKind,
    required String secret,
    String? passphrase,
  }) async {
    final hostId = 'host_${_uuid.v4()}';
    final credentialRef = _secrets.newRef('ssh');
    await _secrets.writeSecret(credentialRef, secret);
    String? passphraseRef;
    if (passphrase != null && passphrase.isNotEmpty) {
      passphraseRef = _secrets.newRef('pass');
      await _secrets.writeSecret(passphraseRef, passphrase);
    }

    await _db.into(_db.remoteHosts).insert(
          RemoteHostsCompanion.insert(
            id: hostId,
            alias: alias,
            host: host,
            port: Value(port),
            username: username,
            authKind: authKind.name,
            credentialRef: credentialRef,
            createdAt: DateTime.now(),
          ),
        );
    return (await getById(hostId))!.copyWith(passphraseRef: passphraseRef);
  }

  Future<void> setFingerprint(String hostId, String? fingerprint) async {
    await (_db.update(_db.remoteHosts)..where((t) => t.id.equals(hostId)))
        .write(RemoteHostsCompanion(knownHostFingerprint: Value(fingerprint)));
  }

  Future<void> markUsed(String hostId) async {
    await (_db.update(_db.remoteHosts)..where((t) => t.id.equals(hostId)))
        .write(RemoteHostsCompanion(lastUsedAt: Value(DateTime.now())));
  }

  Future<void> delete(String hostId) async {
    final row = await (_db.select(_db.remoteHosts)
          ..where((t) => t.id.equals(hostId)))
        .getSingleOrNull();
    if (row != null) {
      await _secrets.deleteSecret(row.credentialRef);
    }
    await (_db.delete(_db.remoteHosts)..where((t) => t.id.equals(hostId))).go();
  }

  SshConnectionConfig configFor(Host h) => SshConnectionConfig(
        hostId: h.id,
        host: h.host,
        port: h.port,
        username: h.username,
        authKind: h.authKind,
        credentialRef: h.credentialRef,
        passphraseRef: h.passphraseRef,
        knownHostFingerprint: h.knownHostFingerprint,
      );

  Host _toDomain(RemoteHost row) => Host(
        id: row.id,
        alias: row.alias,
        host: row.host,
        port: row.port,
        username: row.username,
        authKind: SshAuthKind.values.firstWhere(
          (k) => k.name == row.authKind,
          orElse: () => SshAuthKind.password,
        ),
        credentialRef: row.credentialRef,
        knownHostFingerprint: row.knownHostFingerprint,
        createdAt: row.createdAt,
        lastUsedAt: row.lastUsedAt,
      );
}

import 'package:drift/drift.dart';

import '../persistence/app_database.dart';

/// Stores accepted host fingerprints (TOFU + pinning).
///
/// First contact: the service captures the live fingerprint and we persist
/// it. Subsequent connects: refuse if the live fingerprint differs.
abstract class KnownHostsStore {
  Future<String?> fingerprintFor(String hostId);
  Future<void> remember(String hostId, String fingerprint);
  Future<void> forget(String hostId);
}

/// Drift-backed implementation that stores the fingerprint on the
/// `RemoteHosts` row itself (column `knownHostFingerprint`).
class DriftKnownHostsStore implements KnownHostsStore {
  DriftKnownHostsStore(this._db);
  final AppDatabase _db;

  @override
  Future<String?> fingerprintFor(String hostId) async {
    final row = await (_db.select(_db.remoteHosts)
          ..where((t) => t.id.equals(hostId)))
        .getSingleOrNull();
    return row?.knownHostFingerprint;
  }

  @override
  Future<void> remember(String hostId, String fingerprint) async {
    await (_db.update(_db.remoteHosts)..where((t) => t.id.equals(hostId))).write(
      RemoteHostsCompanion(knownHostFingerprint: Value(fingerprint)),
    );
  }

  @override
  Future<void> forget(String hostId) async {
    await (_db.update(_db.remoteHosts)..where((t) => t.id.equals(hostId))).write(
      const RemoteHostsCompanion(knownHostFingerprint: Value(null)),
    );
  }
}

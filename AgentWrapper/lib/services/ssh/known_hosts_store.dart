/// Stores accepted host fingerprints (TOFU + pinning).
///
/// First contact: prompt the user to confirm the fingerprint and persist it.
/// Subsequent connects: refuse if the live fingerprint differs.
abstract class KnownHostsStore {
  Future<String?> fingerprintFor(String hostId);
  Future<void> remember(String hostId, String fingerprint);
  Future<void> forget(String hostId);
}

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wraps [FlutterSecureStorage] with a domain-friendly API.
///
/// Credentials are stored under opaque references (UUIDs); the database
/// references those keys but never the secret material itself.
class SecretsRepository {
  SecretsRepository({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
              ),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock,
              ),
            );

  final FlutterSecureStorage _storage;

  Future<void> writeSecret(String ref, String value) =>
      _storage.write(key: ref, value: value);

  Future<String?> readSecret(String ref) => _storage.read(key: ref);

  Future<void> deleteSecret(String ref) => _storage.delete(key: ref);

  Future<void> wipeAll() => _storage.deleteAll();
}

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

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
  static const _uuid = Uuid();

  /// Generate a fresh opaque reference to associate with a credential. The
  /// DB stores this string; the actual secret only lives in secure storage.
  String newRef([String prefix = 'cred']) => '${prefix}_${_uuid.v4()}';

  Future<void> writeSecret(String ref, String value) =>
      _storage.write(key: ref, value: value);

  Future<String?> readSecret(String ref) => _storage.read(key: ref);

  Future<void> deleteSecret(String ref) => _storage.delete(key: ref);

  Future<void> wipeAll() => _storage.deleteAll();
}

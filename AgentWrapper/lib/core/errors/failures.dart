/// Sealed-style failure hierarchy used by domain and data layers.
///
/// Repositories return `Failure` (or throw a typed [AppException]); the UI
/// translates these to user-friendly strings. Keeping presentation strings
/// out of the failure types lets us localize later without breaking layers.
sealed class Failure {
  const Failure(this.message, {this.cause});
  final String message;
  final Object? cause;
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message, {super.cause});
}

class SshFailure extends Failure {
  const SshFailure(super.message, {super.cause});
}

class AuthFailure extends Failure {
  const AuthFailure(super.message, {super.cause});
}

class StorageFailure extends Failure {
  const StorageFailure(super.message, {super.cause});
}

class AgentFailure extends Failure {
  const AgentFailure(super.message, {super.cause});
}

class UnexpectedFailure extends Failure {
  const UnexpectedFailure(super.message, {super.cause});
}

/// Throwable counterpart, useful when crossing async boundaries inside data
/// sources where returning a [Failure] is awkward.
class AppException implements Exception {
  AppException(this.failure);
  final Failure failure;

  @override
  String toString() => 'AppException(${failure.runtimeType}: ${failure.message})';
}

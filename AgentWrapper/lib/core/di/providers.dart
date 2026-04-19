import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/agents/data/adapters/claude_agent_adapter.dart';
import '../../features/agents/data/adapters/codex_agent_adapter.dart';
import '../../features/agents/data/adapters/cursor_agent_adapter.dart';
import '../../features/agents/data/agent_registry_impl.dart';
import '../../features/agents/domain/agent_adapter.dart';
import '../../features/agents/domain/agent_registry.dart';
import '../../features/connections/data/hosts_repository.dart';
import '../../features/projects/data/projects_repository.dart';
import '../../features/session/data/sessions_repository.dart';
import '../../services/persistence/app_database.dart';
import '../../services/secure_storage/secrets_repository.dart';
import '../../services/ssh/known_hosts_store.dart';
import '../../services/ssh/ssh_connection_manager.dart';
import '../../services/ssh/ssh_service.dart';

/// Root-level dependency injection providers.
///
/// Heavy resources (database, SSH service, secure storage) live here so the
/// rest of the app composes against interfaces. Each `Provider` is a single
/// place to swap implementations when wiring tests.

/// Overridden in `main.dart` with the real, already-opened database.
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  throw UnimplementedError(
    'appDatabaseProvider must be overridden in main() with a real database.',
  );
});

final secretsRepositoryProvider = Provider<SecretsRepository>((ref) {
  return SecretsRepository();
});

final knownHostsStoreProvider = Provider<KnownHostsStore>((ref) {
  return DriftKnownHostsStore(ref.watch(appDatabaseProvider));
});

final sshServiceProvider = Provider<SshService>((ref) {
  return SshService(
    secrets: ref.watch(secretsRepositoryProvider),
    knownHosts: ref.watch(knownHostsStoreProvider),
  );
});

/// Keeps live SSH sessions keyed by hostId so multiple screens can share
/// the same connection (e.g. host detail + active session).
final sshConnectionManagerProvider = Provider<SshConnectionManager>((ref) {
  final mgr = SshConnectionManager(ref.watch(sshServiceProvider));
  ref.onDispose(mgr.dispose);
  return mgr;
});

final hostsRepositoryProvider = Provider<HostsRepository>((ref) {
  return HostsRepository(
    db: ref.watch(appDatabaseProvider),
    secrets: ref.watch(secretsRepositoryProvider),
  );
});

final projectsRepositoryProvider = Provider<ProjectsRepository>((ref) {
  return ProjectsRepository(ref.watch(appDatabaseProvider));
});

final sessionsRepositoryProvider = Provider<SessionsRepository>((ref) {
  return SessionsRepository(ref.watch(appDatabaseProvider));
});

final agentRegistryProvider = Provider<AgentRegistry>((ref) {
  final adapters = <AgentAdapter>[
    CodexAgentAdapter(),
    CursorAgentAdapter(),
    ClaudeAgentAdapter(),
  ];
  return AgentRegistryImpl(adapters);
});

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/agents/data/adapters/claude_agent_adapter.dart';
import '../../features/agents/data/adapters/codex_agent_adapter.dart';
import '../../features/agents/data/adapters/cursor_agent_adapter.dart';
import '../../features/agents/data/agent_registry_impl.dart';
import '../../features/agents/domain/agent_adapter.dart';
import '../../features/agents/domain/agent_registry.dart';
import '../../services/persistence/app_database.dart';
import '../../services/secure_storage/secrets_repository.dart';
import '../../services/ssh/ssh_service.dart';

/// Root-level dependency injection providers.
///
/// Heavy resources (database, SSH service, secure storage) live here so the
/// rest of the app composes against interfaces. Each `Provider` is a single
/// place to swap implementations when wiring tests.
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  // TODO(infra): open the real Drift database with a concrete executor.
  throw UnimplementedError(
    'appDatabaseProvider must be overridden in main() with a real database.',
  );
});

final secretsRepositoryProvider = Provider<SecretsRepository>((ref) {
  return SecretsRepository();
});

final sshServiceProvider = Provider<SshService>((ref) {
  return SshService();
});

final agentRegistryProvider = Provider<AgentRegistry>((ref) {
  final adapters = <AgentAdapter>[
    CodexAgentAdapter(),
    CursorAgentAdapter(),
    ClaudeAgentAdapter(),
  ];
  return AgentRegistryImpl(adapters);
});

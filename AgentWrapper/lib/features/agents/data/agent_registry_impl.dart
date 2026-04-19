import '../domain/agent_adapter.dart';
import '../domain/agent_kind.dart';
import '../domain/agent_registry.dart';

class AgentRegistryImpl implements AgentRegistry {
  AgentRegistryImpl(List<AgentAdapter> adapters)
      : _byKind = {for (final a in adapters) a.kind: a},
        _all = List.unmodifiable(adapters);

  final Map<AgentKind, AgentAdapter> _byKind;
  final List<AgentAdapter> _all;

  @override
  List<AgentAdapter> get all => _all;

  @override
  AgentAdapter? byKind(AgentKind kind) => _byKind[kind];
}

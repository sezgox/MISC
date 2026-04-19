import 'agent_adapter.dart';
import 'agent_kind.dart';

/// Lookup table that the rest of the app uses to resolve adapters by kind.
abstract class AgentRegistry {
  List<AgentAdapter> get all;
  AgentAdapter? byKind(AgentKind kind);
}

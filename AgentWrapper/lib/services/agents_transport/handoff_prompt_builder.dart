import '../../features/agents/domain/agent_adapter.dart';
import '../../features/agents/domain/handoff_context.dart';

/// Thin facade that delegates to the *destination* adapter to build the
/// handoff prompt. The interesting policy here is "destination decides the
/// format" because each model responds best to its preferred framing.
class HandoffPromptBuilder {
  const HandoffPromptBuilder();

  String build({
    required AgentAdapter destination,
    required HandoffContext context,
  }) {
    return destination.buildHandoffPrompt(context);
  }
}

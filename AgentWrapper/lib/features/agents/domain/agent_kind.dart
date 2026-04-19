/// Identifier for the kinds of CLI agents AgentWrapper can drive.
///
/// New agents only need to add an enum value here, register an
/// [AgentAdapter] implementation, and add a card in the install wizard.
enum AgentKind {
  codex,
  cursor,
  claude;

  String get id => name;

  static AgentKind? tryParse(String? s) {
    for (final k in AgentKind.values) {
      if (k.id == s) return k;
    }
    return null;
  }
}

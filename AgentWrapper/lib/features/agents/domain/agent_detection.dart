/// Result of probing the remote host for a particular agent CLI.
class AgentDetection {
  const AgentDetection({
    required this.installed,
    this.version,
    this.path,
    this.notes,
  });

  final bool installed;

  /// Reported version string (e.g. `1.4.2`), if detection could parse it.
  final String? version;

  /// Filesystem path where the binary was found (`which <agent>`).
  final String? path;

  /// Free-form notes (e.g. "found but login expired").
  final String? notes;

  static const AgentDetection notInstalled = AgentDetection(installed: false);
}

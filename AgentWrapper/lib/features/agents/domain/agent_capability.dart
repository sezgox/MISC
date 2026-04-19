/// Capabilities advertised by an [AgentAdapter] so the UI can render the
/// right controls (skills, MCPs, modes, tools, etc.) without hardcoding
/// per-agent behavior.
enum AgentCapability {
  chat,
  codeBlocks,
  diffs,
  fileWrites,
  shellExecution,
  skills,
  mcps,
  modes,
  imageInputs,
  webBrowsing,
}

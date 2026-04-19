/// Strips ANSI escape sequences from a string.
///
/// We keep the raw stream for the [TerminalView]; this helper is for the
/// chat-style render where we want plain text in [ChatBubble]s.
class AnsiSanitizer {
  AnsiSanitizer._();

  static final RegExp _ansi = RegExp(r'\x1B\[[0-?]*[ -/]*[@-~]');

  static String strip(String input) => input.replaceAll(_ansi, '');
}

/// Heuristics to extract login URLs from CLI output.
///
/// Different agents print URLs in different shapes (`https://...`, framed in
/// boxes, prefixed with arrows, etc.). We keep the regex narrow on purpose
/// to avoid grabbing unrelated URLs (e.g. docs links printed at startup).
class LoginUrlCapture {
  LoginUrlCapture._();

  static final RegExp _urlRegex = RegExp(
    r'https?://[^\s\u2502\u2503\u2551\u00a0\)\]\}>"`'',]+',
  );

  /// Returns the first plausible URL found in [text], or null.
  /// Prefers URLs that look like auth endpoints.
  static String? firstUrl(String text) {
    final matches = _urlRegex.allMatches(text).map((m) => m.group(0)!).toList();
    if (matches.isEmpty) return null;
    final auth = matches.firstWhere(
      (u) => _looksLikeAuthUrl(u),
      orElse: () => matches.first,
    );
    return auth;
  }

  static bool _looksLikeAuthUrl(String url) {
    final lower = url.toLowerCase();
    return lower.contains('login') ||
        lower.contains('auth') ||
        lower.contains('signin') ||
        lower.contains('device') ||
        lower.contains('oauth') ||
        lower.contains('callback');
  }
}

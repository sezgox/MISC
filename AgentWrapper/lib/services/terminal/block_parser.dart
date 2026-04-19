import '../../features/agents/domain/agent_event.dart';

/// Detects fenced code blocks, unified diffs and login URLs in a stream of
/// text and yields structured [AgentEvent]s.
///
/// This is a deliberately small first version. Real adapters can subclass or
/// compose it with their own per-CLI heuristics.
class BlockParser {
  BlockParser();

  final StringBuffer _buffer = StringBuffer();
  bool _inCodeFence = false;
  String? _fenceLang;
  final StringBuffer _codeBuffer = StringBuffer();

  static final RegExp _urlRegex = RegExp(r'https?://[^\s]+');

  Iterable<AgentEvent> consume(String chunk) sync* {
    _buffer.write(chunk);
    final str = _buffer.toString();
    final lines = str.split('\n');
    // Keep last partial line in the buffer; emit complete lines only.
    _buffer
      ..clear()
      ..write(lines.removeLast());

    for (final line in lines) {
      final fence = _matchFence(line);
      if (fence != null) {
        if (_inCodeFence) {
          yield CodeBlockEvent(
            code: _codeBuffer.toString(),
            language: _fenceLang,
          );
          _codeBuffer.clear();
          _fenceLang = null;
          _inCodeFence = false;
        } else {
          _inCodeFence = true;
          _fenceLang = fence;
        }
        continue;
      }
      if (_inCodeFence) {
        _codeBuffer.writeln(line);
        continue;
      }
      final url = _urlRegex.firstMatch(line)?.group(0);
      if (url != null && _looksLikeLogin(url)) {
        yield LoginUrlDetected(url);
      }
      yield TextDelta('$line\n');
    }
  }

  String? _matchFence(String line) {
    final trimmed = line.trimLeft();
    if (!trimmed.startsWith('```')) return null;
    final lang = trimmed.substring(3).trim();
    return lang;
  }

  bool _looksLikeLogin(String url) {
    final u = url.toLowerCase();
    return u.contains('login') ||
        u.contains('auth') ||
        u.contains('signin') ||
        u.contains('device');
  }
}

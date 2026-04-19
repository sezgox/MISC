import 'package:flutter/material.dart';

import 'tokens.dart';

/// Renders a unified diff with per-line highlight. Parsing is intentionally
/// minimal: anything starting with `+` is added, `-` removed, `@@` is a
/// hunk header. Good enough for the bootstrap; richer rendering (intra-line
/// highlights via diff_match_patch) is a follow-up.
class DiffBlock extends StatelessWidget {
  const DiffBlock({super.key, required this.unifiedDiff, this.path});

  final String unifiedDiff;
  final String? path;

  @override
  Widget build(BuildContext context) {
    final lines = unifiedDiff.split('\n');
    return Container(
      decoration: BoxDecoration(
        color: AppTokens.codeBg,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (path != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: AppTokens.space3,
                vertical: AppTokens.space2,
              ),
              decoration: const BoxDecoration(
                color: AppTokens.surfaceAlt,
                border: Border(
                  bottom: BorderSide(color: AppTokens.outlineSoft),
                ),
              ),
              child: Text(
                path!,
                style: const TextStyle(
                  fontFamily: AppTokens.fontMono,
                  color: AppTokens.textMedium,
                  fontSize: 12,
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: AppTokens.space2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [for (final l in lines) _DiffLine(line: l)],
            ),
          ),
        ],
      ),
    );
  }
}

class _DiffLine extends StatelessWidget {
  const _DiffLine({required this.line});
  final String line;

  Color? get _bg {
    if (line.startsWith('+') && !line.startsWith('+++')) return AppTokens.diffAdd;
    if (line.startsWith('-') && !line.startsWith('---')) return AppTokens.diffDel;
    return null;
  }

  Color get _fg {
    if (line.startsWith('@@')) return AppTokens.brandAccent;
    return AppTokens.textHigh;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _bg,
      padding: const EdgeInsets.symmetric(
        horizontal: AppTokens.space3,
        vertical: 2,
      ),
      child: Text(
        line.isEmpty ? ' ' : line,
        style: TextStyle(
          fontFamily: AppTokens.fontMono,
          fontSize: 12,
          height: 1.45,
          color: _fg,
        ),
      ),
    );
  }
}

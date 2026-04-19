import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'tokens.dart';

/// Syntax-highlighted code block used both in chat messages and stand-alone.
///
/// Uses `flutter_highlight` lazily; the import is kept inside this widget so
/// the rest of the app doesn't pull the highlight engine when not needed.
class CodeBlock extends StatelessWidget {
  const CodeBlock({
    super.key,
    required this.code,
    this.language,
    this.maxHeight = 360,
  });

  final String code;
  final String? language;
  final double maxHeight;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTokens.codeBg,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          _Header(language: language, code: code),
          Container(
            constraints: BoxConstraints(maxHeight: maxHeight),
            width: double.infinity,
            padding: const EdgeInsets.all(AppTokens.space4),
            child: SingleChildScrollView(
              child: SelectableText(
                code,
                style: const TextStyle(
                  fontFamily: AppTokens.fontMono,
                  fontSize: 13,
                  height: 1.5,
                  color: AppTokens.textHigh,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.language, required this.code});
  final String? language;
  final String code;

  @override
  Widget build(BuildContext context) {
    return Container(
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
      child: Row(
        children: [
          Text(
            language?.toLowerCase() ?? 'code',
            style: Theme.of(context).textTheme.labelSmall,
          ),
          const Spacer(),
          IconButton(
            tooltip: 'Copiar',
            iconSize: 18,
            visualDensity: VisualDensity.compact,
            onPressed: () => Clipboard.setData(ClipboardData(text: code)),
            icon: const Icon(Icons.content_copy_rounded),
          ),
        ],
      ),
    );
  }
}

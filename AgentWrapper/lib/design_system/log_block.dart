import 'package:flutter/material.dart';

import 'tokens.dart';

class LogLine {
  const LogLine({required this.text, this.level = 'info', this.at});
  final String text;
  final String level;
  final DateTime? at;
}

/// Compact stream of log lines (e.g. install output, runtime events).
class LogBlock extends StatelessWidget {
  const LogBlock({super.key, required this.lines, this.maxHeight = 240});
  final List<LogLine> lines;
  final double maxHeight;

  Color _color(String level) => switch (level) {
        'error' => AppTokens.danger,
        'warn' => AppTokens.warning,
        'success' => AppTokens.success,
        _ => AppTokens.textMedium,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(maxHeight: maxHeight),
      decoration: BoxDecoration(
        color: AppTokens.logLine,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      padding: const EdgeInsets.all(AppTokens.space3),
      child: Scrollbar(
        child: ListView.builder(
          itemCount: lines.length,
          itemBuilder: (_, i) {
            final l = lines[i];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 1),
              child: Text(
                l.text,
                style: TextStyle(
                  fontFamily: AppTokens.fontMono,
                  fontSize: 12,
                  height: 1.4,
                  color: _color(l.level),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

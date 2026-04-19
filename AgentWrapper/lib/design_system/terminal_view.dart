import 'package:flutter/material.dart';
import 'package:xterm/xterm.dart' as xterm;

import 'tokens.dart';

/// Stylised terminal view backed by the `xterm` package.
///
/// The widget owns the [xterm.Terminal] but not the I/O wiring: callers pass
/// an already-attached terminal (typically connected via
/// `services/terminal/terminal_controller.dart` to an `SshShell`).
class AppTerminalView extends StatelessWidget {
  const AppTerminalView({super.key, required this.terminal});

  final xterm.Terminal terminal;

  static const xterm.TerminalTheme _theme = xterm.TerminalTheme(
    cursor: AppTokens.brandAccent,
    selection: AppTokens.surfaceHigh,
    foreground: AppTokens.textHigh,
    background: AppTokens.terminalBg,
    black: Color(0xFF000000),
    red: Color(0xFFEF4444),
    green: Color(0xFF22C55E),
    yellow: Color(0xFFF59E0B),
    blue: Color(0xFF3B82F6),
    magenta: Color(0xFFA855F7),
    cyan: Color(0xFF06B6D4),
    white: Color(0xFFEDEEF2),
    brightBlack: Color(0xFF374151),
    brightRed: Color(0xFFF87171),
    brightGreen: Color(0xFF4ADE80),
    brightYellow: Color(0xFFFBBF24),
    brightBlue: Color(0xFF60A5FA),
    brightMagenta: Color(0xFFC084FC),
    brightCyan: Color(0xFF22D3EE),
    brightWhite: Color(0xFFFFFFFF),
    searchHitBackground: Color(0xFF7C5CFF),
    searchHitBackgroundCurrent: Color(0xFF5A3FE0),
    searchHitForeground: Color(0xFFFFFFFF),
  );

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTokens.terminalBg,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      clipBehavior: Clip.antiAlias,
      padding: const EdgeInsets.all(AppTokens.space2),
      child: xterm.TerminalView(
        terminal,
        theme: _theme,
        textStyle: const xterm.TerminalStyle(
          fontFamily: AppTokens.fontMono,
          fontSize: 13,
          height: 1.3,
        ),
        autofocus: true,
      ),
    );
  }
}

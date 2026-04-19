import 'package:flutter/material.dart';

/// Design tokens for AgentWrapper.
///
/// Single source of truth for colors, spacing, radii and typography.
/// Tokens are dark-first because the product is terminal-centric.
class AppTokens {
  AppTokens._();

  // Spacing scale (4pt grid)
  static const double space1 = 4;
  static const double space2 = 8;
  static const double space3 = 12;
  static const double space4 = 16;
  static const double space5 = 24;
  static const double space6 = 32;
  static const double space7 = 48;
  static const double space8 = 64;

  // Radii
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 20;
  static const Radius radiusBubble = Radius.circular(radiusLg);

  // Touch targets (a11y)
  static const double minTouchSize = 44;

  // Brand palette
  static const Color brandPrimary = Color(0xFF7C5CFF);
  static const Color brandPrimaryDim = Color(0xFF5A3FE0);
  static const Color brandAccent = Color(0xFF00E5BD);

  // Surface palette (dark)
  static const Color bg = Color(0xFF0B0D12);
  static const Color surface = Color(0xFF12151C);
  static const Color surfaceAlt = Color(0xFF181C25);
  static const Color surfaceHigh = Color(0xFF222735);
  static const Color outline = Color(0xFF2A2F3D);
  static const Color outlineSoft = Color(0xFF1E2230);

  // Text
  static const Color textHigh = Color(0xFFEDEEF2);
  static const Color textMedium = Color(0xFFB7BCCB);
  static const Color textLow = Color(0xFF7A8295);

  // Semantic
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Roles per chat / terminal block
  static const Color userBubble = Color(0xFF1F2433);
  static const Color agentBubble = Color(0xFF181E2C);
  static const Color systemBubble = Color(0xFF14171F);
  static const Color codeBg = Color(0xFF0E1118);
  static const Color terminalBg = Color(0xFF05070C);
  static const Color diffAdd = Color(0xFF103A21);
  static const Color diffDel = Color(0xFF3A1010);
  static const Color logLine = Color(0xFF0F1320);

  // Typography. Using `null` lets Flutter fall back to the platform default
  // until we ship custom font assets (Inter + JetBrainsMono) in `assets/fonts/`.
  static const String? fontUi = null;
  static const String fontMono = 'monospace';
}

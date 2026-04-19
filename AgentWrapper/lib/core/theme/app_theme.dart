import 'package:flutter/material.dart';

import '../../design_system/tokens.dart';

/// Builds the global [ThemeData] for the app.
///
/// Dark-first: the product is terminal-centric and most users will live in
/// dark mode. A light theme is intentionally not provided yet to keep the
/// design system small until the visual language is stable.
class AppTheme {
  AppTheme._();

  static ThemeData dark() {
    final colorScheme = const ColorScheme.dark(
      primary: AppTokens.brandPrimary,
      onPrimary: Colors.white,
      secondary: AppTokens.brandAccent,
      onSecondary: Colors.black,
      surface: AppTokens.surface,
      onSurface: AppTokens.textHigh,
      error: AppTokens.danger,
      onError: Colors.white,
      outline: AppTokens.outline,
    );

    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppTokens.bg,
      canvasColor: AppTokens.bg,
      fontFamily: AppTokens.fontUi,
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppTokens.bg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: AppTokens.textHigh,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.2,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppTokens.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusLg),
          side: const BorderSide(color: AppTokens.outlineSoft),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppTokens.surfaceAlt,
        hintStyle: const TextStyle(color: AppTokens.textLow),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppTokens.space4,
          vertical: AppTokens.space3,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          borderSide: const BorderSide(color: AppTokens.outlineSoft),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          borderSide: const BorderSide(color: AppTokens.outlineSoft),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          borderSide: const BorderSide(color: AppTokens.brandPrimary),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, AppTokens.minTouchSize),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, AppTokens.minTouchSize),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTokens.radiusMd),
          ),
          side: const BorderSide(color: AppTokens.outline),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppTokens.surfaceHigh,
        side: const BorderSide(color: AppTokens.outlineSoft),
        labelStyle: const TextStyle(color: AppTokens.textHigh),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTokens.radiusSm),
        ),
      ),
      dividerColor: AppTokens.outlineSoft,
      listTileTheme: const ListTileThemeData(
        iconColor: AppTokens.textMedium,
        textColor: AppTokens.textHigh,
      ),
      textTheme: base.textTheme
          .apply(
            bodyColor: AppTokens.textHigh,
            displayColor: AppTokens.textHigh,
          )
          .copyWith(
            titleLarge: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
            titleMedium: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
            bodyMedium: const TextStyle(
              fontSize: 14,
              height: 1.45,
              color: AppTokens.textMedium,
            ),
            labelSmall: const TextStyle(
              fontSize: 11,
              color: AppTokens.textLow,
              letterSpacing: 0.4,
            ),
          ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../design_system/tokens.dart';

class AppEmptyState extends StatelessWidget {
  const AppEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.space6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppTokens.surfaceAlt,
                shape: BoxShape.circle,
                border: Border.all(color: AppTokens.outlineSoft),
              ),
              child: Icon(icon, size: 32, color: AppTokens.textMedium),
            ),
            const SizedBox(height: AppTokens.space4),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            if (message != null) ...[
              const SizedBox(height: AppTokens.space2),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: AppTokens.space4),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../design_system/tokens.dart';
import '../../features/agents/domain/agent_kind.dart';

/// Compact chip showing an agent identity. Uses the kind's brand color.
class AgentChip extends StatelessWidget {
  const AgentChip({super.key, required this.kind, this.selected = false});

  final AgentKind kind;
  final bool selected;

  Color get _color => switch (kind) {
        AgentKind.codex => const Color(0xFF22C55E),
        AgentKind.cursor => const Color(0xFF7C5CFF),
        AgentKind.claude => const Color(0xFFE07A5F),
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTokens.space3,
        vertical: AppTokens.space2,
      ),
      decoration: BoxDecoration(
        color: selected ? _color.withValues(alpha: 0.18) : AppTokens.surfaceHigh,
        borderRadius: BorderRadius.circular(AppTokens.radiusSm),
        border: Border.all(
          color: selected ? _color : AppTokens.outlineSoft,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: _color, shape: BoxShape.circle),
          ),
          const SizedBox(width: AppTokens.space2),
          Text(
            kind.id,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTokens.textHigh,
            ),
          ),
        ],
      ),
    );
  }
}

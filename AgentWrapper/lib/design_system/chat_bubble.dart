import 'package:flutter/material.dart';

import 'tokens.dart';

enum ChatRole { user, agent, system }

/// Conversational bubble used in [SessionScreen]. Variants per role keep the
/// chat scannable without being noisy.
class ChatBubble extends StatelessWidget {
  const ChatBubble({
    super.key,
    required this.role,
    required this.child,
    this.label,
    this.timestamp,
  });

  final ChatRole role;
  final Widget child;
  final String? label;
  final DateTime? timestamp;

  Color get _bg => switch (role) {
        ChatRole.user => AppTokens.userBubble,
        ChatRole.agent => AppTokens.agentBubble,
        ChatRole.system => AppTokens.systemBubble,
      };

  Alignment get _align =>
      role == ChatRole.user ? Alignment.centerRight : Alignment.centerLeft;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: _align,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.92,
        ),
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: AppTokens.space2),
          decoration: BoxDecoration(
            color: _bg,
            borderRadius: const BorderRadius.all(AppTokens.radiusBubble),
            border: Border.all(color: AppTokens.outlineSoft),
          ),
          padding: const EdgeInsets.all(AppTokens.space4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (label != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppTokens.space2),
                  child: Text(
                    label!.toUpperCase(),
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ),
              child,
              if (timestamp != null)
                Padding(
                  padding: const EdgeInsets.only(top: AppTokens.space2),
                  child: Text(
                    _formatTime(timestamp!),
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime t) {
    final h = t.hour.toString().padLeft(2, '0');
    final m = t.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

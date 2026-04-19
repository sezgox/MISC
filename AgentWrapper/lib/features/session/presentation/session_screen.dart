import 'package:flutter/material.dart';

import '../../../core/widgets/agent_chip.dart';
import '../../../design_system/chat_bubble.dart';
import '../../../design_system/code_block.dart';
import '../../../design_system/diff_block.dart';
import '../../../design_system/log_block.dart';
import '../../../design_system/tokens.dart';
import '../../agents/domain/agent_kind.dart';

/// Star screen of the app. Two tabs ("Chat" and "Terminal") sharing the same
/// underlying session. Bottom bar exposes agent selector + skills/MCPs/modes.
class SessionScreen extends StatefulWidget {
  const SessionScreen({super.key, required this.sessionId});
  final String sessionId;

  @override
  State<SessionScreen> createState() => _SessionScreenState();
}

class _SessionScreenState extends State<SessionScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);
  AgentKind _agent = AgentKind.codex;
  final TextEditingController _input = TextEditingController();

  @override
  void dispose() {
    _tabs.dispose();
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sesi\u00f3n'),
        bottom: TabBar(
          controller: _tabs,
          tabs: const [
            Tab(icon: Icon(Icons.chat_bubble_outline_rounded), text: 'Chat'),
            Tab(icon: Icon(Icons.terminal_rounded), text: 'Terminal'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            tooltip: 'Skills / MCPs / Modos',
            onPressed: _openSkillsSheet,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _ChatView(),
          _TerminalPlaceholder(),
        ],
      ),
      bottomNavigationBar: _BottomBar(
        agent: _agent,
        onAgentTap: _openAgentSwitcher,
        controller: _input,
      ),
    );
  }

  void _openAgentSwitcher() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppTokens.surface,
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppTokens.space4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Cambiar de agente',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: AppTokens.space2),
              const Text(
                'La conversaci\u00f3n se mantiene; enviaremos un prompt de handoff al nuevo agente.',
              ),
              const SizedBox(height: AppTokens.space4),
              for (final k in AgentKind.values)
                ListTile(
                  leading: AgentChip(kind: k, selected: _agent == k),
                  title: Text(k.id),
                  onTap: () {
                    setState(() => _agent = k);
                    Navigator.pop(context);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _openSkillsSheet() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppTokens.surface,
      builder: (_) => const _SkillsSheet(),
    );
  }
}

class _ChatView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppTokens.space4),
      children: [
        ChatBubble(
          role: ChatRole.user,
          label: 'T\u00fa',
          timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
          child: const Text('Refactoriza este endpoint para que sea async.'),
        ),
        ChatBubble(
          role: ChatRole.agent,
          label: 'codex',
          timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'Aqu\u00ed tienes el cambio. Convierto el handler a async y actualizo los tests.',
              ),
              SizedBox(height: AppTokens.space3),
              DiffBlock(
                path: 'api/handlers/users.py',
                unifiedDiff: '''@@ -10,6 +10,8 @@
-def get_user(id):
-    return db.query(id)
+async def get_user(id):
+    return await db.query(id)
''',
              ),
            ],
          ),
        ),
        ChatBubble(
          role: ChatRole.agent,
          label: 'codex \u00b7 c\u00f3digo',
          timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
          child: const CodeBlock(
            language: 'python',
            code: '''async def get_user(id: str) -> User:
    return await db.query(id)''',
          ),
        ),
        ChatBubble(
          role: ChatRole.system,
          label: 'logs',
          child: const LogBlock(
            lines: [
              LogLine(text: '\$ pytest -k get_user', level: 'info'),
              LogLine(text: 'collected 2 items', level: 'info'),
              LogLine(text: '...... 2 passed in 0.42s', level: 'success'),
            ],
          ),
        ),
      ],
    );
  }
}

class _TerminalPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // The real terminal will be `AppTerminalView` driven by a TerminalController
    // that bridges xterm with an SshShell. Kept as a stub until the SSH layer
    // is wired.
    return Container(
      margin: const EdgeInsets.all(AppTokens.space4),
      padding: const EdgeInsets.all(AppTokens.space4),
      decoration: BoxDecoration(
        color: AppTokens.terminalBg,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      alignment: Alignment.topLeft,
      child: const SelectableText(
        '\$ tmux attach -t misc\n[detached terminal vivir\u00e1 aqu\u00ed]\n',
        style: TextStyle(
          fontFamily: AppTokens.fontMono,
          color: AppTokens.textMedium,
          fontSize: 12,
          height: 1.5,
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.agent,
    required this.onAgentTap,
    required this.controller,
  });
  final AgentKind agent;
  final VoidCallback onAgentTap;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppTokens.outlineSoft)),
          color: AppTokens.bg,
        ),
        padding: const EdgeInsets.fromLTRB(
          AppTokens.space3,
          AppTokens.space2,
          AppTokens.space3,
          AppTokens.space3,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(AppTokens.radiusSm),
                  onTap: onAgentTap,
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: AgentChip(kind: agent, selected: true),
                  ),
                ),
                const SizedBox(width: AppTokens.space2),
                _PillButton(icon: Icons.psychology_rounded, label: 'modo'),
                const SizedBox(width: AppTokens.space2),
                _PillButton(icon: Icons.extension_rounded, label: 'skills'),
                const SizedBox(width: AppTokens.space2),
                _PillButton(icon: Icons.lan_rounded, label: 'mcps'),
              ],
            ),
            const SizedBox(height: AppTokens.space2),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    minLines: 1,
                    maxLines: 5,
                    decoration: const InputDecoration(
                      hintText: 'Escribe un prompt...',
                    ),
                  ),
                ),
                const SizedBox(width: AppTokens.space2),
                FilledButton(
                  onPressed: () => controller.clear(),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.square(AppTokens.minTouchSize),
                    padding: const EdgeInsets.all(AppTokens.space3),
                  ),
                  child: const Icon(Icons.send_rounded),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PillButton extends StatelessWidget {
  const _PillButton({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTokens.space2,
        vertical: AppTokens.space1,
      ),
      decoration: BoxDecoration(
        color: AppTokens.surfaceHigh,
        borderRadius: BorderRadius.circular(AppTokens.radiusSm),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppTokens.textMedium),
          const SizedBox(width: 4),
          Text(label,
              style:
                  const TextStyle(fontSize: 12, color: AppTokens.textMedium)),
        ],
      ),
    );
  }
}

class _SkillsSheet extends StatelessWidget {
  const _SkillsSheet();
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.space4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Skills, MCPs y modos',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppTokens.space3),
            const Text('Toggles y selectores aparecer\u00e1n aqu\u00ed seg\u00fan el agente activo.'),
            const SizedBox(height: AppTokens.space3),
            Wrap(
              spacing: AppTokens.space2,
              runSpacing: AppTokens.space2,
              children: const [
                FilterChip(label: Text('thinking'), selected: true, onSelected: null),
                FilterChip(label: Text('plan'), selected: false, onSelected: null),
                FilterChip(label: Text('agent'), selected: false, onSelected: null),
                FilterChip(label: Text('ask'), selected: false, onSelected: null),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

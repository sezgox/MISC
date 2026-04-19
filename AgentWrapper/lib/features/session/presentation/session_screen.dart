import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/widgets/agent_chip.dart';
import '../../../design_system/chat_bubble.dart';
import '../../../design_system/code_block.dart';
import '../../../design_system/diff_block.dart';
import '../../../design_system/log_block.dart';
import '../../../design_system/terminal_view.dart';
import '../../../design_system/tokens.dart';
import '../../agents/domain/agent_kind.dart';
import '../application/session_controller.dart';

/// Star screen of the app. Two tabs ("Chat" and "Terminal") sharing the same
/// underlying session. Bottom bar exposes agent selector + skills/MCPs/modes.
class SessionScreen extends ConsumerStatefulWidget {
  const SessionScreen({super.key, required this.sessionId});
  final String sessionId;

  @override
  ConsumerState<SessionScreen> createState() => _SessionScreenState();
}

class _SessionScreenState extends ConsumerState<SessionScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 2, vsync: this);
  final TextEditingController _input = TextEditingController();
  final ScrollController _chatScroll = ScrollController();

  @override
  void dispose() {
    _tabs.dispose();
    _input.dispose();
    _chatScroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final async =
        ref.watch(sessionControllerProvider(widget.sessionId));
    return Scaffold(
      appBar: AppBar(
        title: Text(async.asData?.value.agent.id.toUpperCase() ?? 'Sesi\u00f3n'),
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
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (state) {
          _scheduleAutoscroll();
          return TabBarView(
            controller: _tabs,
            children: [
              _ChatView(state: state, scroll: _chatScroll),
              _TerminalTab(sessionId: widget.sessionId),
            ],
          );
        },
      ),
      bottomNavigationBar: async.when(
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
        data: (state) => _BottomBar(
          agent: state.agent,
          isRunning: state.isRunning,
          onAgentTap: () => _openAgentSwitcher(state),
          controller: _input,
          onSend: (text) => ref
              .read(sessionControllerProvider(widget.sessionId).notifier)
              .sendPrompt(text),
        ),
      ),
    );
  }

  void _scheduleAutoscroll() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_chatScroll.hasClients) {
        _chatScroll.animateTo(
          _chatScroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _openAgentSwitcher(SessionViewState state) {
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
                  leading: AgentChip(kind: k, selected: state.agent == k),
                  title: Text(k.id),
                  onTap: () async {
                    Navigator.pop(context);
                    await ref
                        .read(sessionControllerProvider(widget.sessionId)
                            .notifier)
                        .switchAgent(k);
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
  const _ChatView({required this.state, required this.scroll});
  final SessionViewState state;
  final ScrollController scroll;

  @override
  Widget build(BuildContext context) {
    if (state.error != null) {
      return Padding(
        padding: const EdgeInsets.all(AppTokens.space4),
        child: Card(
          color: AppTokens.danger.withValues(alpha: 0.12),
          child: Padding(
            padding: const EdgeInsets.all(AppTokens.space4),
            child: Text(state.error!),
          ),
        ),
      );
    }
    return ListView.builder(
      controller: scroll,
      padding: const EdgeInsets.all(AppTokens.space4),
      itemCount: state.messages.length,
      itemBuilder: (_, i) => _MessageBubble(message: state.messages[i]),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});
  final ChatMessage message;

  ChatRole get _role => switch (message.role) {
        'user' => ChatRole.user,
        'agent' => ChatRole.agent,
        _ => ChatRole.system,
      };

  @override
  Widget build(BuildContext context) {
    switch (message.kind) {
      case 'code':
        return ChatBubble(
          role: _role,
          label: message.language ?? 'code',
          timestamp: message.createdAt,
          child: CodeBlock(code: message.content, language: message.language),
        );
      case 'diff':
        return ChatBubble(
          role: _role,
          label: message.path ?? 'diff',
          timestamp: message.createdAt,
          child: DiffBlock(
            unifiedDiff: message.content,
            path: message.path,
          ),
        );
      case 'log':
        return ChatBubble(
          role: ChatRole.system,
          label: 'log',
          child: LogBlock(lines: [
            LogLine(text: message.content, level: message.level ?? 'info'),
          ]),
        );
      case 'url':
        return ChatBubble(
          role: ChatRole.system,
          label: 'login',
          timestamp: message.createdAt,
          child: _LoginUrlContent(url: message.content),
        );
      case 'handoff':
        return ChatBubble(
          role: ChatRole.system,
          label: 'handoff',
          timestamp: message.createdAt,
          child: Text(message.content),
        );
      case 'text':
      default:
        return ChatBubble(
          role: _role,
          label: _role == ChatRole.user
              ? 'T\u00fa'
              : _role == ChatRole.agent
                  ? 'agente${message.partial ? ' \u00b7 escribiendo...' : ''}'
                  : 'sistema',
          timestamp: message.partial ? null : message.createdAt,
          child: SelectableText(
            message.content.isEmpty && message.partial
                ? '\u2026'
                : message.content,
          ),
        );
    }
  }
}

class _LoginUrlContent extends StatelessWidget {
  const _LoginUrlContent({required this.url});
  final String url;
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Abre esta URL en el navegador para completar el login:'),
        const SizedBox(height: AppTokens.space2),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppTokens.space3),
          decoration: BoxDecoration(
            color: AppTokens.surfaceAlt,
            borderRadius: BorderRadius.circular(AppTokens.radiusSm),
            border: Border.all(color: AppTokens.outlineSoft),
          ),
          child: SelectableText(
            url,
            style: const TextStyle(fontFamily: AppTokens.fontMono, fontSize: 12),
          ),
        ),
        const SizedBox(height: AppTokens.space2),
        Row(
          children: [
            FilledButton.tonalIcon(
              icon: const Icon(Icons.copy_rounded),
              label: const Text('Copiar'),
              onPressed: () =>
                  Clipboard.setData(ClipboardData(text: url)),
            ),
            const SizedBox(width: AppTokens.space2),
            FilledButton.icon(
              icon: const Icon(Icons.open_in_new_rounded),
              label: const Text('Abrir'),
              onPressed: () => launchUrl(
                Uri.parse(url),
                mode: LaunchMode.externalApplication,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _TerminalTab extends ConsumerWidget {
  const _TerminalTab({required this.sessionId});
  final String sessionId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller =
        ref.watch(sessionControllerProvider(sessionId).notifier).terminal;
    if (controller == null) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(AppTokens.space4),
          child: Text('Terminal no disponible (a\u00fan conectando).'),
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.all(AppTokens.space3),
      child: AppTerminalView(terminal: controller.terminal),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.agent,
    required this.isRunning,
    required this.onAgentTap,
    required this.controller,
    required this.onSend,
  });
  final AgentKind agent;
  final bool isRunning;
  final VoidCallback onAgentTap;
  final TextEditingController controller;
  final Future<void> Function(String text) onSend;

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
                Icon(
                  isRunning ? Icons.play_circle_rounded : Icons.pause_circle_rounded,
                  size: 14,
                  color: isRunning ? AppTokens.success : AppTokens.textMedium,
                ),
                const SizedBox(width: 4),
                Text(
                  isRunning ? 'en ejecuci\u00f3n' : 'en espera',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppTokens.textMedium,
                  ),
                ),
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
                    textInputAction: TextInputAction.newline,
                    decoration: const InputDecoration(
                      hintText: 'Escribe un prompt...',
                    ),
                  ),
                ),
                const SizedBox(width: AppTokens.space2),
                FilledButton(
                  onPressed: () async {
                    final text = controller.text;
                    if (text.trim().isEmpty) return;
                    controller.clear();
                    await onSend(text);
                  },
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
            const Text(
              'Los toggles reales se mostrar\u00e1n aqu\u00ed seg\u00fan las capacidades del agente activo.',
            ),
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

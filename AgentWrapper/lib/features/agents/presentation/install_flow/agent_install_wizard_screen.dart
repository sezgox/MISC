import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/di/providers.dart';
import '../../../../core/widgets/agent_chip.dart';
import '../../../../design_system/log_block.dart';
import '../../../../design_system/tokens.dart';
import '../../../../services/ssh/ssh_session.dart';
import '../../domain/agent_install_step.dart';
import '../../domain/agent_kind.dart';

class AgentInstallWizardScreen extends ConsumerStatefulWidget {
  const AgentInstallWizardScreen({
    super.key,
    required this.hostId,
    this.initialKind,
  });
  final String hostId;
  final String? initialKind;

  @override
  ConsumerState<AgentInstallWizardScreen> createState() => _State();
}

class _State extends ConsumerState<AgentInstallWizardScreen> {
  AgentKind? _selected;
  bool _running = false;
  final List<AgentInstallStep> _events = [];
  String? _loginUrl;
  StreamSubscription<AgentInstallStep>? _sub;

  @override
  void initState() {
    super.initState();
    if (widget.initialKind != null) {
      _selected = AgentKind.tryParse(widget.initialKind);
    }
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Instalar agente'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppTokens.space4),
        children: [
          Text('1. Elegir agente',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppTokens.space2),
          for (final k in AgentKind.values)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                onTap: _running ? null : () => setState(() => _selected = k),
                child: Container(
                  padding: const EdgeInsets.all(AppTokens.space3),
                  decoration: BoxDecoration(
                    color: _selected == k
                        ? AppTokens.surfaceHigh
                        : AppTokens.surface,
                    borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                    border: Border.all(
                      color: _selected == k
                          ? AppTokens.brandPrimary
                          : AppTokens.outlineSoft,
                    ),
                  ),
                  child: Row(
                    children: [
                      AgentChip(kind: k, selected: _selected == k),
                      const SizedBox(width: AppTokens.space3),
                      Expanded(child: Text(_taglineFor(k))),
                    ],
                  ),
                ),
              ),
            ),
          const SizedBox(height: AppTokens.space4),
          if (_selected != null) ...[
            Text('2. Ejecutar instalaci\u00f3n',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppTokens.space2),
            if (!_running && _events.isEmpty)
              FilledButton.icon(
                icon: const Icon(Icons.play_arrow_rounded),
                label: const Text('Empezar instalaci\u00f3n'),
                onPressed: _start,
              )
            else
              _LiveLog(events: _events, running: _running),
            if (_loginUrl != null) ...[
              const SizedBox(height: AppTokens.space3),
              _LoginUrlCard(url: _loginUrl!),
            ],
          ],
        ],
      ),
    );
  }

  Future<void> _start() async {
    final kind = _selected;
    if (kind == null) return;
    final mgr = ref.read(sshConnectionManagerProvider);
    final hosts = ref.read(hostsRepositoryProvider);
    final registry = ref.read(agentRegistryProvider);
    final host = await hosts.getById(widget.hostId);
    if (host == null) return;
    final adapter = registry.byKind(kind);
    if (adapter == null) return;

    setState(() {
      _running = true;
      _events.clear();
      _loginUrl = null;
    });

    try {
      SshSession? session = mgr.sessionFor(host.id);
      session ??= await mgr.connect(hosts.configFor(host));

      _sub = adapter.install(session).listen(
        (step) {
          setState(() {
            _events.add(step);
            if (step.kind == AgentInstallStepKind.loginUrl &&
                step.loginUrl != null) {
              _loginUrl = step.loginUrl;
            }
          });
        },
        onError: (Object e) {
          setState(() {
            _events.add(AgentInstallStep(
              id: 'err',
              title: 'Error',
              kind: AgentInstallStepKind.failed,
              error: e.toString(),
              isFinal: true,
            ));
            _running = false;
          });
        },
        onDone: () => setState(() => _running = false),
      );
    } on Object catch (e) {
      setState(() {
        _events.add(AgentInstallStep(
          id: 'err',
          title: 'Conexi\u00f3n',
          kind: AgentInstallStepKind.failed,
          error: e.toString(),
          isFinal: true,
        ));
        _running = false;
      });
    }
  }

  String _taglineFor(AgentKind k) => switch (k) {
        AgentKind.codex => 'OpenAI Codex CLI',
        AgentKind.cursor => 'Cursor CLI agente',
        AgentKind.claude => 'Anthropic Claude Code',
      };
}

class _LiveLog extends StatelessWidget {
  const _LiveLog({required this.events, required this.running});
  final List<AgentInstallStep> events;
  final bool running;

  @override
  Widget build(BuildContext context) {
    final lines = <LogLine>[];
    for (final s in events) {
      final emoji = switch (s.kind) {
        AgentInstallStepKind.command => '\$',
        AgentInstallStepKind.verification => '?',
        AgentInstallStepKind.done => '\u2713',
        AgentInstallStepKind.failed => '\u2717',
        AgentInstallStepKind.loginUrl => '\u2192',
        AgentInstallStepKind.waitingForUser => '\u23f3',
      };
      lines.add(LogLine(
        text: '$emoji ${s.title}${s.command == null ? '' : '  ${s.command}'}',
        level: s.kind == AgentInstallStepKind.failed ? 'error' : 'info',
      ));
      if (s.outputChunk != null && s.outputChunk!.trim().isNotEmpty) {
        for (final l in s.outputChunk!.split('\n')) {
          lines.add(LogLine(text: '    $l'));
        }
      }
      if (s.error != null) {
        lines.add(LogLine(text: '    ${s.error}', level: 'error'));
      }
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LogBlock(lines: lines, maxHeight: 360),
        if (running)
          const Padding(
            padding: EdgeInsets.only(top: AppTokens.space2),
            child: Row(
              children: [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                SizedBox(width: AppTokens.space2),
                Text('Instalando...'),
              ],
            ),
          ),
      ],
    );
  }
}

class _LoginUrlCard extends StatelessWidget {
  const _LoginUrlCard({required this.url});
  final String url;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.open_in_new_rounded, color: AppTokens.brandAccent),
                SizedBox(width: AppTokens.space2),
                Text('Completa el login'),
              ],
            ),
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
                style: const TextStyle(
                    fontFamily: AppTokens.fontMono, fontSize: 12),
              ),
            ),
            const SizedBox(height: AppTokens.space3),
            Row(
              children: [
                FilledButton.tonalIcon(
                  icon: const Icon(Icons.copy_rounded),
                  label: const Text('Copiar'),
                  onPressed: () => Clipboard.setData(ClipboardData(text: url)),
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
        ),
      ),
    );
  }
}

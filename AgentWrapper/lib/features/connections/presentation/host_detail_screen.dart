import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/providers.dart';
import '../../../core/router/app_router.dart';
import '../../../core/widgets/agent_chip.dart';
import '../../../design_system/tokens.dart';
import '../../../services/persistence/app_database.dart';
import '../../../services/ssh/ssh_connection_manager.dart';
import '../../../services/ssh/ssh_session.dart';
import '../../agents/domain/agent_detection.dart';
import '../../agents/domain/agent_kind.dart';
import '../domain/host.dart';

class HostDetailScreen extends ConsumerStatefulWidget {
  const HostDetailScreen({super.key, required this.hostId});
  final String hostId;

  @override
  ConsumerState<HostDetailScreen> createState() => _HostDetailScreenState();
}

class _HostDetailScreenState extends ConsumerState<HostDetailScreen> {
  Map<AgentKind, AgentDetection>? _detections;
  bool _detecting = false;

  @override
  Widget build(BuildContext context) {
    final hostAsync = ref.watch(_hostProvider(widget.hostId));
    return Scaffold(
      appBar: AppBar(
        title: Text(hostAsync.asData?.value?.alias ?? 'M\u00e1quina'),
      ),
      body: hostAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (host) {
          if (host == null) {
            return const Center(child: Text('M\u00e1quina no encontrada'));
          }
          return _HostBody(
            host: host,
            detections: _detections,
            detecting: _detecting,
            onConnect: () => _connect(host),
            onDisconnect: () => _disconnect(host),
            onDetect: () => _detect(host),
            onStartSession: (kind, projectPath) =>
                _startSession(host, kind, projectPath),
          );
        },
      ),
    );
  }

  Future<void> _connect(Host host) async {
    final mgr = ref.read(sshConnectionManagerProvider);
    final hosts = ref.read(hostsRepositoryProvider);
    try {
      await mgr.connect(hosts.configFor(host));
      await _detect(host);
    } on Object catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error de conexi\u00f3n: $e')),
        );
      }
    }
  }

  Future<void> _disconnect(Host host) async {
    await ref.read(sshConnectionManagerProvider).disconnect(host.id);
    setState(() => _detections = null);
  }

  Future<void> _detect(Host host) async {
    final mgr = ref.read(sshConnectionManagerProvider);
    SshSession? session = mgr.sessionFor(host.id);
    session ??= await mgr.connect(
      ref.read(hostsRepositoryProvider).configFor(host),
    );
    final registry = ref.read(agentRegistryProvider);
    setState(() => _detecting = true);
    try {
      final results = <AgentKind, AgentDetection>{};
      for (final adapter in registry.all) {
        try {
          results[adapter.kind] = await adapter.detect(session);
        } on Object {
          results[adapter.kind] = AgentDetection.notInstalled;
        }
      }
      if (mounted) setState(() => _detections = results);
    } finally {
      if (mounted) setState(() => _detecting = false);
    }
  }

  Future<void> _startSession(
      Host host, AgentKind kind, String? projectPath) async {
    final repo = ref.read(sessionsRepositoryProvider);
    String? projectId;
    if (projectPath != null) {
      final list =
          await ref.read(projectsRepositoryProvider).getForHost(host.id);
      final match = list.where((p) => p.path == projectPath).toList();
      projectId = match.isEmpty ? null : match.first.id;
    }
    final session = await repo.create(
      hostId: host.id,
      agentKind: kind,
      projectId: projectId,
    );
    if (mounted) {
      context.push(AppRoutes.session(session.id));
    }
  }
}

final _hostProvider =
    StreamProvider.family<Host?, String>((ref, hostId) async* {
  final repo = ref.watch(hostsRepositoryProvider);
  yield await repo.getById(hostId);
  await for (final _ in repo.watchAll()) {
    yield await repo.getById(hostId);
  }
});

class _HostBody extends ConsumerWidget {
  const _HostBody({
    required this.host,
    required this.detections,
    required this.detecting,
    required this.onConnect,
    required this.onDisconnect,
    required this.onDetect,
    required this.onStartSession,
  });

  final Host host;
  final Map<AgentKind, AgentDetection>? detections;
  final bool detecting;
  final VoidCallback onConnect;
  final VoidCallback onDisconnect;
  final VoidCallback onDetect;
  final void Function(AgentKind kind, String? projectPath) onStartSession;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mgr = ref.watch(sshConnectionManagerProvider);
    return StreamBuilder<SshConnectionState>(
      stream: mgr.stateFor(host.id),
      initialData: mgr.current(host.id),
      builder: (context, snap) {
        final st = snap.data ?? SshConnectionState.idle;
        return ListView(
          padding: const EdgeInsets.all(AppTokens.space4),
          children: [
            _ConnectionCard(
              host: host,
              state: st,
              onConnect: onConnect,
              onDisconnect: onDisconnect,
            ),
            const SizedBox(height: AppTokens.space5),
            _SectionHeader(
              title: 'Agentes',
              trailing: st.status == SshConnectionStatus.connected
                  ? TextButton.icon(
                      icon: detecting
                          ? const SizedBox(
                              width: 14,
                              height: 14,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.refresh_rounded),
                      label: const Text('Detectar'),
                      onPressed: detecting ? null : onDetect,
                    )
                  : null,
            ),
            _AgentsCard(
              detections: detections,
              connected: st.status == SshConnectionStatus.connected,
              onStartSession: (k) => onStartSession(k, null),
              onInstall: (kind) => context.push(
                '${AppRoutes.hostDetail(host.id)}/install?kind=${kind.id}',
              ),
            ),
            const SizedBox(height: AppTokens.space5),
            _SectionHeader(
              title: 'Proyectos guardados',
              trailing: TextButton(
                onPressed: () => context.push(AppRoutes.projects(host.id)),
                child: const Text('Ver todos'),
              ),
            ),
            _ProjectsCard(
              hostId: host.id,
              onOpen: (path) async {
                final kind = _firstReadyKind() ?? AgentKind.codex;
                onStartSession(kind, path);
              },
            ),
          ],
        );
      },
    );
  }

  AgentKind? _firstReadyKind() {
    if (detections == null) return null;
    for (final e in detections!.entries) {
      if (e.value.installed) return e.key;
    }
    return null;
  }
}

class _ConnectionCard extends StatelessWidget {
  const _ConnectionCard({
    required this.host,
    required this.state,
    required this.onConnect,
    required this.onDisconnect,
  });
  final Host host;
  final SshConnectionState state;
  final VoidCallback onConnect;
  final VoidCallback onDisconnect;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _kv(context, 'Host', '${host.host}:${host.port}'),
            _kv(context, 'Usuario', host.username),
            _kv(
              context,
              'Auth',
              host.authKind.name == 'password' ? 'contrase\u00f1a' : 'clave privada',
            ),
            _kv(
              context,
              'Fingerprint',
              host.knownHostFingerprint ?? state.fingerprint ?? '(sin fijar)',
            ),
            const SizedBox(height: AppTokens.space3),
            Row(
              children: [
                if (state.status == SshConnectionStatus.connected)
                  OutlinedButton.icon(
                    icon: const Icon(Icons.link_off_rounded),
                    label: const Text('Desconectar'),
                    onPressed: onDisconnect,
                  )
                else
                  FilledButton.icon(
                    icon: state.status == SshConnectionStatus.connecting
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child:
                                CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.link_rounded),
                    label: Text(
                      state.status == SshConnectionStatus.connecting
                          ? 'Conectando...'
                          : 'Conectar',
                    ),
                    onPressed: state.status == SshConnectionStatus.connecting
                        ? null
                        : onConnect,
                  ),
                const SizedBox(width: AppTokens.space2),
                if (state.status == SshConnectionStatus.error)
                  Expanded(
                    child: Text(
                      state.error ?? '',
                      style: const TextStyle(color: AppTokens.danger, fontSize: 12),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _kv(BuildContext context, String k, String v) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppTokens.space1),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(k, style: Theme.of(context).textTheme.labelSmall),
          ),
          Expanded(child: SelectableText(v)),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.trailing});
  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        left: AppTokens.space1,
        bottom: AppTokens.space2,
      ),
      child: Row(
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const Spacer(),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

class _AgentsCard extends StatelessWidget {
  const _AgentsCard({
    required this.detections,
    required this.connected,
    required this.onStartSession,
    required this.onInstall,
  });
  final Map<AgentKind, AgentDetection>? detections;
  final bool connected;
  final void Function(AgentKind) onStartSession;
  final void Function(AgentKind) onInstall;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.space3),
        child: Column(
          children: [
            for (final k in AgentKind.values)
              _AgentRow(
                kind: k,
                detection: detections?[k],
                connected: connected,
                onInstall: () => onInstall(k),
                onStart: () => onStartSession(k),
              ),
          ],
        ),
      ),
    );
  }
}

class _AgentRow extends StatelessWidget {
  const _AgentRow({
    required this.kind,
    required this.detection,
    required this.connected,
    required this.onInstall,
    required this.onStart,
  });
  final AgentKind kind;
  final AgentDetection? detection;
  final bool connected;
  final VoidCallback onInstall;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final installed = detection?.installed ?? false;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppTokens.space1),
      child: Row(
        children: [
          AgentChip(kind: kind, selected: installed),
          const SizedBox(width: AppTokens.space3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  installed
                      ? 'Instalado${detection?.version == null ? '' : ' \u00b7 ${detection!.version}'}'
                      : connected
                          ? 'No instalado'
                          : (detection == null ? 'Sin datos' : 'No instalado'),
                  style: const TextStyle(fontSize: 12),
                ),
                if (detection?.path != null)
                  Text(detection!.path!,
                      style: const TextStyle(
                          fontSize: 11,
                          fontFamily: AppTokens.fontMono,
                          color: AppTokens.textMedium)),
              ],
            ),
          ),
          if (installed)
            FilledButton.tonalIcon(
              icon: const Icon(Icons.play_arrow_rounded),
              label: const Text('Abrir'),
              onPressed: onStart,
            )
          else
            OutlinedButton.icon(
              icon: const Icon(Icons.download_rounded),
              label: const Text('Instalar'),
              onPressed: connected ? onInstall : null,
            ),
        ],
      ),
    );
  }
}

class _ProjectsCard extends ConsumerWidget {
  const _ProjectsCard({required this.hostId, required this.onOpen});
  final String hostId;
  final void Function(String path) onOpen;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stream = ref.watch(projectsRepositoryProvider).watchForHost(hostId);
    return Card(
      child: StreamBuilder<List<Project>>(
        stream: stream,
        builder: (context, snap) {
          final projects = snap.data ?? const <Project>[];
          if (projects.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(AppTokens.space4),
              child: Text('Sin proyectos. A\u00f1ade paths desde "Ver todos".'),
            );
          }
          return Column(
            children: [
              for (final p in projects)
                ListTile(
                  leading: Icon(
                    p.favorite ? Icons.star_rounded : Icons.folder_rounded,
                    color: p.favorite
                        ? AppTokens.warning
                        : AppTokens.brandAccent,
                  ),
                  title: Text(p.label ?? p.path),
                  subtitle: p.label == null ? null : Text(p.path),
                  trailing: const Icon(Icons.play_arrow_rounded),
                  onTap: () => onOpen(p.path),
                ),
            ],
          );
        },
      ),
    );
  }
}

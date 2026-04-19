import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/widgets/agent_chip.dart';
import '../../../design_system/tokens.dart';
import '../../agents/domain/agent_kind.dart';

class HostDetailScreen extends StatelessWidget {
  const HostDetailScreen({super.key, required this.hostId});
  final String hostId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('misc-server'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppTokens.space4),
        children: [
          _Section(
            title: 'Conexi\u00f3n',
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(AppTokens.space4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _kv(context, 'Host', '192.168.1.42:22'),
                    _kv(context, 'Usuario', 'sezgox'),
                    _kv(context, 'Auth', 'clave privada'),
                    _kv(context, 'Fingerprint', 'SHA256:9d...e2'),
                  ],
                ),
              ),
            ),
          ),
          _Section(
            title: 'Agentes',
            trailing: TextButton.icon(
              icon: const Icon(Icons.add_rounded),
              label: const Text('Instalar'),
              onPressed: () => context.push(AppRoutes.installAgent(hostId)),
            ),
            child: Wrap(
              spacing: AppTokens.space2,
              runSpacing: AppTokens.space2,
              children: const [
                AgentChip(kind: AgentKind.codex, selected: true),
                AgentChip(kind: AgentKind.cursor),
                AgentChip(kind: AgentKind.claude),
              ],
            ),
          ),
          _Section(
            title: 'Proyectos guardados',
            trailing: TextButton(
              onPressed: () => context.push(AppRoutes.projects(hostId)),
              child: const Text('Ver todos'),
            ),
            child: Card(
              child: Column(
                children: [
                  for (final p in const ['/home/sezgox/MISC', '/srv/projects/api'])
                    ListTile(
                      leading: const Icon(Icons.folder_rounded),
                      title: Text(p),
                      trailing: const Icon(Icons.play_arrow_rounded),
                      onTap: () => context.push(AppRoutes.session('mock-session-1')),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.terminal_rounded),
        label: const Text('Nueva sesi\u00f3n'),
        onPressed: () => context.push(AppRoutes.session('mock-session-1')),
      ),
    );
  }

  Widget _kv(BuildContext context, String k, String v) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppTokens.space1),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(k, style: Theme.of(context).textTheme.labelSmall),
          ),
          Expanded(child: Text(v)),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child, this.trailing});
  final String title;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTokens.space5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
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
          ),
          child,
        ],
      ),
    );
  }
}

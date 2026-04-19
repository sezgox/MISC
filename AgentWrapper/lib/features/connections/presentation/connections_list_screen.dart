import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/providers.dart';
import '../../../core/router/app_router.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../design_system/tokens.dart';
import '../../../services/ssh/ssh_connection_manager.dart';
import '../domain/host.dart';

class ConnectionsListScreen extends ConsumerWidget {
  const ConnectionsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hostsStream = ref.watch(_hostsStreamProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('M\u00e1quinas'),
        actions: [
          IconButton(
            tooltip: 'Ajustes',
            icon: const Icon(Icons.settings_rounded),
            onPressed: () => context.push(AppRoutes.settings),
          ),
        ],
      ),
      body: hostsStream.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (hosts) {
          if (hosts.isEmpty) {
            return AppEmptyState(
              icon: Icons.dns_rounded,
              title: 'A\u00fan no hay m\u00e1quinas',
              message: 'A\u00f1ade tu primera conexi\u00f3n SSH para empezar.',
              action: FilledButton.icon(
                icon: const Icon(Icons.add_rounded),
                label: const Text('A\u00f1adir m\u00e1quina'),
                onPressed: () => context.push(AppRoutes.newConnection),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.space4),
            itemCount: hosts.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: AppTokens.space3),
            itemBuilder: (_, i) => _HostTile(host: hosts[i]),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.newConnection),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Nueva'),
      ),
    );
  }
}

final _hostsStreamProvider = StreamProvider<List<Host>>((ref) {
  return ref.watch(hostsRepositoryProvider).watchAll();
});

class _HostTile extends ConsumerWidget {
  const _HostTile({required this.host});
  final Host host;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mgr = ref.watch(sshConnectionManagerProvider);
    return StreamBuilder<SshConnectionState>(
      stream: mgr.stateFor(host.id),
      initialData: mgr.current(host.id),
      builder: (context, snap) {
        final st = snap.data ?? SshConnectionState.idle;
        return Card(
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(
              horizontal: AppTokens.space4,
              vertical: AppTokens.space2,
            ),
            leading: CircleAvatar(
              backgroundColor: AppTokens.surfaceHigh,
              child: Icon(
                Icons.dns_rounded,
                color: _statusColor(st.status),
              ),
            ),
            title: Text(host.alias),
            subtitle: Text('${host.username}@${host.host}:${host.port}'
                '${st.status == SshConnectionStatus.connected ? '  \u2022  conectado' : ''}'
                '${st.status == SshConnectionStatus.connecting ? '  \u2022  conectando...' : ''}'
                '${st.status == SshConnectionStatus.error ? '  \u2022  error' : ''}'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                PopupMenuButton<String>(
                  onSelected: (v) async {
                    switch (v) {
                      case 'delete':
                        final ok = await _confirmDelete(context, host);
                        if (ok == true) {
                          await ref
                              .read(hostsRepositoryProvider)
                              .delete(host.id);
                        }
                    }
                  },
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'delete', child: Text('Eliminar')),
                  ],
                ),
                const Icon(Icons.chevron_right_rounded),
              ],
            ),
            onTap: () => context.push(AppRoutes.hostDetail(host.id)),
          ),
        );
      },
    );
  }

  Color _statusColor(SshConnectionStatus s) => switch (s) {
        SshConnectionStatus.connected => AppTokens.success,
        SshConnectionStatus.connecting => AppTokens.warning,
        SshConnectionStatus.error => AppTokens.danger,
        SshConnectionStatus.idle => AppTokens.brandAccent,
      };

  Future<bool?> _confirmDelete(BuildContext context, Host h) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Eliminar m\u00e1quina'),
        content: Text(
          '\u00bfSeguro que quieres borrar "${h.alias}"? Se eliminar\u00e1n tambi\u00e9n sus credenciales del llavero.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton.tonal(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
  }
}

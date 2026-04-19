import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../design_system/tokens.dart';

class ConnectionsListScreen extends StatelessWidget {
  const ConnectionsListScreen({super.key});

  // TODO(connections): replace with a Riverpod provider that reads from Drift.
  static const _mockHosts = <_MockHost>[
    _MockHost(id: 'h1', alias: 'misc-server', host: '192.168.1.42', user: 'sezgox'),
    _MockHost(id: 'h2', alias: 'vps-prod', host: 'vps.example.com', user: 'deploy'),
  ];

  @override
  Widget build(BuildContext context) {
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
      body: _mockHosts.isEmpty
          ? AppEmptyState(
              icon: Icons.dns_rounded,
              title: 'A\u00fan no hay m\u00e1quinas',
              message: 'A\u00f1ade tu primera conexi\u00f3n SSH para empezar.',
              action: FilledButton.icon(
                icon: const Icon(Icons.add_rounded),
                label: const Text('A\u00f1adir m\u00e1quina'),
                onPressed: () => context.push(AppRoutes.newConnection),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppTokens.space4),
              itemCount: _mockHosts.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppTokens.space3),
              itemBuilder: (_, i) {
                final h = _mockHosts[i];
                return Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: AppTokens.space4,
                      vertical: AppTokens.space2,
                    ),
                    leading: const CircleAvatar(
                      backgroundColor: AppTokens.surfaceHigh,
                      child: Icon(Icons.dns_rounded, color: AppTokens.brandAccent),
                    ),
                    title: Text(h.alias),
                    subtitle: Text('${h.user}@${h.host}'),
                    trailing: const Icon(Icons.chevron_right_rounded),
                    onTap: () => context.push(AppRoutes.hostDetail(h.id)),
                  ),
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

class _MockHost {
  const _MockHost({
    required this.id,
    required this.alias,
    required this.host,
    required this.user,
  });
  final String id;
  final String alias;
  final String host;
  final String user;
}

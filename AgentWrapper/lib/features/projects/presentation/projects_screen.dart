import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../design_system/tokens.dart';

class ProjectsScreen extends StatelessWidget {
  const ProjectsScreen({super.key, required this.hostId});
  final String hostId;

  static const _mock = <_MockProject>[
    _MockProject(id: 'p1', path: '/home/sezgox/MISC', label: 'MISC monorepo', favorite: true),
    _MockProject(id: 'p2', path: '/srv/projects/api', label: 'Backend API'),
    _MockProject(id: 'p3', path: '/workspace/landing'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Proyectos')),
      body: _mock.isEmpty
          ? AppEmptyState(
              icon: Icons.folder_outlined,
              title: 'Sin proyectos guardados',
              message: 'Guarda paths remotos para abrirlos directamente.',
              action: FilledButton.icon(
                icon: const Icon(Icons.add_rounded),
                label: const Text('A\u00f1adir path'),
                onPressed: () {},
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppTokens.space4),
              itemCount: _mock.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppTokens.space2),
              itemBuilder: (_, i) {
                final p = _mock[i];
                return Card(
                  child: ListTile(
                    leading: Icon(
                      p.favorite ? Icons.star_rounded : Icons.folder_rounded,
                      color: p.favorite ? AppTokens.warning : AppTokens.brandAccent,
                    ),
                    title: Text(p.label ?? p.path),
                    subtitle: p.label == null ? null : Text(p.path),
                    trailing: const Icon(Icons.play_arrow_rounded),
                    onTap: () =>
                        context.push(AppRoutes.session('mock-session-1')),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add_rounded),
        label: const Text('A\u00f1adir'),
        onPressed: () {},
      ),
    );
  }
}

class _MockProject {
  const _MockProject({
    required this.id,
    required this.path,
    this.label,
    this.favorite = false,
  });
  final String id;
  final String path;
  final String? label;
  final bool favorite;
}

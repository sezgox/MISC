import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/providers.dart';
import '../../../core/router/app_router.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../design_system/tokens.dart';
import '../../../services/persistence/app_database.dart';
import '../../agents/domain/agent_kind.dart';

class ProjectsScreen extends ConsumerWidget {
  const ProjectsScreen({super.key, required this.hostId});
  final String hostId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stream = ref.watch(projectsRepositoryProvider).watchForHost(hostId);
    return Scaffold(
      appBar: AppBar(title: const Text('Proyectos')),
      body: StreamBuilder<List<Project>>(
        stream: stream,
        builder: (context, snap) {
          final projects = snap.data ?? const <Project>[];
          if (projects.isEmpty) {
            return AppEmptyState(
              icon: Icons.folder_outlined,
              title: 'Sin proyectos guardados',
              message: 'Guarda paths remotos para abrirlos directamente.',
              action: FilledButton.icon(
                icon: const Icon(Icons.add_rounded),
                label: const Text('A\u00f1adir path'),
                onPressed: () => _addProject(context, ref),
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.space4),
            itemCount: projects.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: AppTokens.space2),
            itemBuilder: (_, i) {
              final p = projects[i];
              return Card(
                child: ListTile(
                  leading: IconButton(
                    icon: Icon(
                      p.favorite ? Icons.star_rounded : Icons.star_outline_rounded,
                      color: p.favorite
                          ? AppTokens.warning
                          : AppTokens.brandAccent,
                    ),
                    onPressed: () => ref
                        .read(projectsRepositoryProvider)
                        .toggleFavorite(p.id),
                  ),
                  title: Text(p.label ?? p.path),
                  subtitle: p.label == null ? null : Text(p.path),
                  trailing: PopupMenuButton<String>(
                    onSelected: (v) async {
                      switch (v) {
                        case 'open':
                          await _openSession(context, ref, p);
                        case 'delete':
                          await ref
                              .read(projectsRepositoryProvider)
                              .delete(p.id);
                      }
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'open', child: Text('Abrir sesi\u00f3n')),
                      PopupMenuItem(value: 'delete', child: Text('Eliminar')),
                    ],
                  ),
                  onTap: () => _openSession(context, ref, p),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add_rounded),
        label: const Text('A\u00f1adir'),
        onPressed: () => _addProject(context, ref),
      ),
    );
  }

  Future<void> _addProject(BuildContext context, WidgetRef ref) async {
    final path = TextEditingController();
    final label = TextEditingController();
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('A\u00f1adir proyecto'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: path,
              decoration: const InputDecoration(
                labelText: 'Path remoto',
                hintText: '/home/user/proyecto',
              ),
              autofocus: true,
            ),
            const SizedBox(height: AppTokens.space2),
            TextField(
              controller: label,
              decoration: const InputDecoration(labelText: 'Etiqueta (opcional)'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
    if (saved == true && path.text.trim().isNotEmpty) {
      await ref.read(projectsRepositoryProvider).create(
            hostId: hostId,
            path: path.text.trim(),
            label: label.text.trim().isEmpty ? null : label.text.trim(),
          );
    }
  }

  Future<void> _openSession(
      BuildContext context, WidgetRef ref, Project p) async {
    final session = await ref.read(sessionsRepositoryProvider).create(
          hostId: hostId,
          agentKind: AgentKind.codex,
          projectId: p.id,
        );
    if (context.mounted) {
      context.push(AppRoutes.session(session.id));
    }
  }
}

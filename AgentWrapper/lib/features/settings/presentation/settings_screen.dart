import 'package:flutter/material.dart';

import '../../../design_system/tokens.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes')),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: AppTokens.space3),
        children: [
          _Section(title: 'Apariencia', children: [
            SwitchListTile(
              value: true,
              onChanged: (_) {},
              title: const Text('Tema oscuro'),
              subtitle: const Text('Optimizado para sesiones largas con terminal.'),
            ),
          ]),
          _Section(title: 'Seguridad', children: [
            SwitchListTile(
              value: true,
              onChanged: (_) {},
              title: const Text('Bloquear capturas de pantalla'),
              subtitle: const Text('Activa FLAG_SECURE en pantallas con secretos.'),
            ),
            const ListTile(
              leading: Icon(Icons.fingerprint_rounded),
              title: Text('Bloqueo biom\u00e9trico al abrir la app'),
              subtitle: Text('Pendiente de implementaci\u00f3n.'),
            ),
            const ListTile(
              leading: Icon(Icons.shield_rounded),
              title: Text('Confirmar comandos peligrosos'),
              subtitle: Text('rm -rf, git reset --hard, etc.'),
            ),
          ]),
          _Section(title: 'Telemetr\u00eda', children: [
            SwitchListTile(
              value: false,
              onChanged: (_) {},
              title: const Text('Compartir diagn\u00f3sticos'),
              subtitle: const Text('Desactivado por defecto.'),
            ),
          ]),
          _Section(title: 'Sobre', children: const [
            ListTile(
              leading: Icon(Icons.info_outline_rounded),
              title: Text('Versi\u00f3n'),
              subtitle: Text('0.1.0 (bootstrap)'),
            ),
          ]),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTokens.space4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppTokens.space4,
              AppTokens.space2,
              AppTokens.space4,
              AppTokens.space2,
            ),
            child: Text(title.toUpperCase(),
                style: Theme.of(context).textTheme.labelSmall),
          ),
          ...children,
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../design_system/tokens.dart';
import '../../../services/ssh/ssh_service.dart';

class ConnectionFormScreen extends StatefulWidget {
  const ConnectionFormScreen({super.key});

  @override
  State<ConnectionFormScreen> createState() => _ConnectionFormScreenState();
}

class _ConnectionFormScreenState extends State<ConnectionFormScreen> {
  final _alias = TextEditingController();
  final _host = TextEditingController();
  final _port = TextEditingController(text: '22');
  final _user = TextEditingController();
  final _secret = TextEditingController();
  SshAuthKind _authKind = SshAuthKind.password;

  @override
  void dispose() {
    _alias.dispose();
    _host.dispose();
    _port.dispose();
    _user.dispose();
    _secret.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nueva m\u00e1quina')),
      body: ListView(
        padding: const EdgeInsets.all(AppTokens.space4),
        children: [
          TextField(
            controller: _alias,
            decoration: const InputDecoration(labelText: 'Alias'),
          ),
          const SizedBox(height: AppTokens.space3),
          TextField(
            controller: _host,
            decoration: const InputDecoration(labelText: 'Host'),
          ),
          const SizedBox(height: AppTokens.space3),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _port,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Puerto'),
                ),
              ),
              const SizedBox(width: AppTokens.space3),
              Expanded(
                flex: 2,
                child: TextField(
                  controller: _user,
                  decoration: const InputDecoration(labelText: 'Usuario'),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTokens.space5),
          Text('Autenticaci\u00f3n', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppTokens.space2),
          SegmentedButton<SshAuthKind>(
            segments: const [
              ButtonSegment(
                value: SshAuthKind.password,
                label: Text('Contrase\u00f1a'),
                icon: Icon(Icons.password_rounded),
              ),
              ButtonSegment(
                value: SshAuthKind.privateKey,
                label: Text('Clave'),
                icon: Icon(Icons.vpn_key_rounded),
              ),
            ],
            selected: {_authKind},
            onSelectionChanged: (s) => setState(() => _authKind = s.first),
          ),
          const SizedBox(height: AppTokens.space3),
          TextField(
            controller: _secret,
            obscureText: _authKind == SshAuthKind.password,
            maxLines: _authKind == SshAuthKind.privateKey ? 6 : 1,
            decoration: InputDecoration(
              labelText: _authKind == SshAuthKind.password
                  ? 'Contrase\u00f1a'
                  : 'Clave privada (PEM)',
              hintText: _authKind == SshAuthKind.privateKey
                  ? '-----BEGIN OPENSSH PRIVATE KEY-----...'
                  : null,
            ),
          ),
          const SizedBox(height: AppTokens.space5),
          OutlinedButton.icon(
            icon: const Icon(Icons.network_check_rounded),
            label: const Text('Probar conexi\u00f3n'),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Test de conexi\u00f3n a\u00fan no implementado'),
                ),
              );
            },
          ),
          const SizedBox(height: AppTokens.space3),
          FilledButton.icon(
            icon: const Icon(Icons.save_rounded),
            label: const Text('Guardar m\u00e1quina'),
            onPressed: () => context.pop(),
          ),
        ],
      ),
    );
  }
}

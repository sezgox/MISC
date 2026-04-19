import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/di/providers.dart';
import '../../../design_system/tokens.dart';
import '../../../services/ssh/ssh_service.dart';

class ConnectionFormScreen extends ConsumerStatefulWidget {
  const ConnectionFormScreen({super.key});

  @override
  ConsumerState<ConnectionFormScreen> createState() =>
      _ConnectionFormScreenState();
}

class _ConnectionFormScreenState extends ConsumerState<ConnectionFormScreen> {
  final _alias = TextEditingController();
  final _host = TextEditingController();
  final _port = TextEditingController(text: '22');
  final _user = TextEditingController();
  final _secret = TextEditingController();
  final _passphrase = TextEditingController();
  SshAuthKind _authKind = SshAuthKind.password;
  bool _busy = false;
  SshProbeResult? _lastProbe;

  @override
  void dispose() {
    _alias.dispose();
    _host.dispose();
    _port.dispose();
    _user.dispose();
    _secret.dispose();
    _passphrase.dispose();
    super.dispose();
  }

  bool get _canSubmit =>
      _alias.text.trim().isNotEmpty &&
      _host.text.trim().isNotEmpty &&
      _user.text.trim().isNotEmpty &&
      _secret.text.isNotEmpty &&
      int.tryParse(_port.text.trim()) != null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nueva m\u00e1quina')),
      body: AbsorbPointer(
        absorbing: _busy,
        child: ListView(
          padding: const EdgeInsets.all(AppTokens.space4),
          children: [
            TextField(
              controller: _alias,
              decoration: const InputDecoration(labelText: 'Alias'),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: AppTokens.space3),
            TextField(
              controller: _host,
              decoration: const InputDecoration(
                labelText: 'Host',
                hintText: '192.168.1.42 o vps.example.com',
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: AppTokens.space3),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _port,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Puerto'),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: AppTokens.space3),
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: _user,
                    decoration: const InputDecoration(labelText: 'Usuario'),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTokens.space5),
            Text('Autenticaci\u00f3n',
                style: Theme.of(context).textTheme.titleMedium),
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
              onChanged: (_) => setState(() {}),
            ),
            if (_authKind == SshAuthKind.privateKey) ...[
              const SizedBox(height: AppTokens.space3),
              TextField(
                controller: _passphrase,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Passphrase (opcional)',
                ),
              ),
            ],
            const SizedBox(height: AppTokens.space5),
            if (_lastProbe != null)
              Container(
                margin: const EdgeInsets.only(bottom: AppTokens.space3),
                padding: const EdgeInsets.all(AppTokens.space3),
                decoration: BoxDecoration(
                  color: _lastProbe!.ok
                      ? AppTokens.success.withValues(alpha: 0.12)
                      : AppTokens.danger.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                  border: Border.all(color: AppTokens.outlineSoft),
                ),
                child: Row(
                  children: [
                    Icon(
                      _lastProbe!.ok
                          ? Icons.check_circle_rounded
                          : Icons.error_rounded,
                      color: _lastProbe!.ok
                          ? AppTokens.success
                          : AppTokens.danger,
                    ),
                    const SizedBox(width: AppTokens.space2),
                    Expanded(
                      child: Text(
                        _lastProbe!.ok
                            ? 'Conexi\u00f3n OK (whoami=${_lastProbe!.whoami}).\nFingerprint: ${_lastProbe!.fingerprint}'
                            : 'Fall\u00f3: ${_lastProbe!.error}',
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
            OutlinedButton.icon(
              icon: _busy
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.network_check_rounded),
              label: const Text('Probar conexi\u00f3n'),
              onPressed: _canSubmit ? _probe : null,
            ),
            const SizedBox(height: AppTokens.space3),
            FilledButton.icon(
              icon: const Icon(Icons.save_rounded),
              label: const Text('Guardar m\u00e1quina'),
              onPressed: _canSubmit ? _save : null,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _probe() async {
    setState(() {
      _busy = true;
      _lastProbe = null;
    });
    try {
      final ssh = ref.read(sshServiceProvider);
      final secrets = ref.read(secretsRepositoryProvider);
      final credRef = secrets.newRef('probe');
      final passRef =
          _passphrase.text.isEmpty ? null : secrets.newRef('probe_pass');
      await secrets.writeSecret(credRef, _secret.text);
      if (passRef != null) {
        await secrets.writeSecret(passRef, _passphrase.text);
      }
      try {
        final result = await ssh.testConnection(
          SshConnectionConfig(
            hostId: 'probe_${DateTime.now().microsecondsSinceEpoch}',
            host: _host.text.trim(),
            port: int.parse(_port.text.trim()),
            username: _user.text.trim(),
            authKind: _authKind,
            credentialRef: credRef,
            passphraseRef: passRef,
          ),
        );
        setState(() => _lastProbe = result);
      } finally {
        await secrets.deleteSecret(credRef);
        if (passRef != null) await secrets.deleteSecret(passRef);
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      final repo = ref.read(hostsRepositoryProvider);
      await repo.create(
        alias: _alias.text.trim(),
        host: _host.text.trim(),
        port: int.parse(_port.text.trim()),
        username: _user.text.trim(),
        authKind: _authKind,
        secret: _secret.text,
        passphrase: _passphrase.text.isEmpty ? null : _passphrase.text,
      );
      if (mounted) context.pop();
    } on Object catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }
}

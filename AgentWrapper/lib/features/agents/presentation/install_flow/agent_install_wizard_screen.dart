import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/agent_chip.dart';
import '../../../../design_system/tokens.dart';
import '../../domain/agent_kind.dart';

class AgentInstallWizardScreen extends StatefulWidget {
  const AgentInstallWizardScreen({super.key, required this.hostId});
  final String hostId;

  @override
  State<AgentInstallWizardScreen> createState() => _State();
}

class _State extends State<AgentInstallWizardScreen> {
  int _step = 0;
  AgentKind? _selected;

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
      body: Stepper(
        currentStep: _step,
        type: StepperType.vertical,
        controlsBuilder: (context, details) => Padding(
          padding: const EdgeInsets.only(top: AppTokens.space3),
          child: Row(
            children: [
              FilledButton(
                onPressed: details.onStepContinue,
                child: const Text('Siguiente'),
              ),
              const SizedBox(width: AppTokens.space2),
              if (_step > 0)
                TextButton(
                  onPressed: details.onStepCancel,
                  child: const Text('Atr\u00e1s'),
                ),
            ],
          ),
        ),
        onStepContinue: () => setState(() => _step = (_step + 1).clamp(0, 4)),
        onStepCancel: () => setState(() => _step = (_step - 1).clamp(0, 4)),
        steps: [
          Step(
            title: const Text('Elegir agente'),
            isActive: _step >= 0,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final k in AgentKind.values)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                      onTap: () => setState(() => _selected = k),
                      child: Container(
                        padding: const EdgeInsets.all(AppTokens.space3),
                        decoration: BoxDecoration(
                          color: _selected == k ? AppTokens.surfaceHigh : AppTokens.surface,
                          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                          border: Border.all(
                            color: _selected == k ? AppTokens.brandPrimary : AppTokens.outlineSoft,
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
              ],
            ),
          ),
          const Step(
            title: Text('Revisar requisitos'),
            content: _DetectionPlaceholder(),
          ),
          const Step(
            title: Text('Ejecutar instalaci\u00f3n'),
            content: _LiveLogPlaceholder(),
          ),
          const Step(
            title: Text('Completar login'),
            content: _LoginUrlPlaceholder(),
          ),
          const Step(
            title: Text('Verificar y terminar'),
            content: _DonePlaceholder(),
          ),
        ],
      ),
    );
  }

  String _taglineFor(AgentKind k) => switch (k) {
        AgentKind.codex => 'OpenAI Codex CLI',
        AgentKind.cursor => 'Cursor CLI agente',
        AgentKind.claude => 'Anthropic Claude Code',
      };
}

class _DetectionPlaceholder extends StatelessWidget {
  const _DetectionPlaceholder();
  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(AppTokens.space4),
        child: Row(
          children: [
            Icon(Icons.search_rounded, color: AppTokens.brandAccent),
            SizedBox(width: AppTokens.space3),
            Expanded(
              child: Text(
                'Comprobaremos si el agente est\u00e1 instalado en el servidor y su versi\u00f3n.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LiveLogPlaceholder extends StatelessWidget {
  const _LiveLogPlaceholder();
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      padding: const EdgeInsets.all(AppTokens.space3),
      decoration: BoxDecoration(
        color: AppTokens.codeBg,
        borderRadius: BorderRadius.circular(AppTokens.radiusMd),
        border: Border.all(color: AppTokens.outlineSoft),
      ),
      child: const Text(
        '\$ npm i -g @openai/codex\n[######    ] downloading...',
        style: TextStyle(
          fontFamily: AppTokens.fontMono,
          color: AppTokens.textMedium,
          fontSize: 12,
          height: 1.5,
        ),
      ),
    );
  }
}

class _LoginUrlPlaceholder extends StatelessWidget {
  const _LoginUrlPlaceholder();
  static const _url = 'https://example.com/oauth/device?code=XXXX-YYYY';

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
                Text('Abre esta URL en el navegador'),
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
              child: const SelectableText(
                _url,
                style: TextStyle(fontFamily: AppTokens.fontMono, fontSize: 12),
              ),
            ),
            const SizedBox(height: AppTokens.space3),
            Row(
              children: [
                FilledButton.tonalIcon(
                  icon: const Icon(Icons.copy_rounded),
                  label: const Text('Copiar'),
                  onPressed: () =>
                      Clipboard.setData(const ClipboardData(text: _url)),
                ),
                const SizedBox(width: AppTokens.space2),
                FilledButton.icon(
                  icon: const Icon(Icons.open_in_new_rounded),
                  label: const Text('Abrir'),
                  onPressed: () {},
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DonePlaceholder extends StatelessWidget {
  const _DonePlaceholder();
  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(AppTokens.space4),
        child: Row(
          children: [
            Icon(Icons.check_circle_rounded, color: AppTokens.success),
            SizedBox(width: AppTokens.space3),
            Expanded(child: Text('Agente listo. Puedes empezar una sesi\u00f3n.')),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../design_system/tokens.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  static const _slides = [
    (
      title: 'Tus agentes, donde sea',
      body: 'Conecta por SSH a tu servidor y usa Codex, Cursor, Claude y otros desde el m\u00f3vil.',
      icon: Icons.bolt_rounded,
    ),
    (
      title: 'Chat + terminal premium',
      body: 'Salidas con bloques de c\u00f3digo, diffs y logs en una UI cuidada.',
      icon: Icons.chat_bubble_rounded,
    ),
    (
      title: 'Cambia de agente sin perder contexto',
      body: 'La conversaci\u00f3n vive en la app. Cambia de modelo y nosotros transferimos el contexto.',
      icon: Icons.sync_alt_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isLast = _index == _slides.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (i) => setState(() => _index = i),
                itemCount: _slides.length,
                itemBuilder: (_, i) {
                  final s = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.all(AppTokens.space6),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            color: AppTokens.surfaceAlt,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppTokens.outlineSoft),
                          ),
                          child: Icon(s.icon, size: 44, color: AppTokens.brandAccent),
                        ),
                        const SizedBox(height: AppTokens.space5),
                        Text(
                          s.title,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: AppTokens.space3),
                        Text(
                          s.body,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < _slides.length; i++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    height: 6,
                    width: i == _index ? 22 : 6,
                    decoration: BoxDecoration(
                      color: i == _index ? AppTokens.brandPrimary : AppTokens.outline,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(AppTokens.space5),
              child: Row(
                children: [
                  TextButton(
                    onPressed: () => context.go(AppRoutes.connections),
                    child: const Text('Saltar'),
                  ),
                  const Spacer(),
                  FilledButton(
                    onPressed: () {
                      if (isLast) {
                        context.go(AppRoutes.connections);
                      } else {
                        _controller.nextPage(
                          duration: const Duration(milliseconds: 240),
                          curve: Curves.easeOutCubic,
                        );
                      }
                    },
                    child: Text(isLast ? 'Empezar' : 'Siguiente'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

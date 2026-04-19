import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/agents/presentation/install_flow/agent_install_wizard_screen.dart';
import '../../features/connections/presentation/connection_form_screen.dart';
import '../../features/connections/presentation/connections_list_screen.dart';
import '../../features/connections/presentation/host_detail_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/projects/presentation/projects_screen.dart';
import '../../features/session/presentation/session_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';

/// Centralized, typed-ish routes. We use plain string constants instead of a
/// generated router for now to keep the base lean; switch to
/// `go_router_builder` when navigation grows.
class AppRoutes {
  AppRoutes._();

  static const onboarding = '/onboarding';
  static const connections = '/connections';
  static const newConnection = '/connections/new';
  static String hostDetail(String hostId) => '/connections/$hostId';
  static String installAgent(String hostId) => '/connections/$hostId/install';
  static String projects(String hostId) => '/connections/$hostId/projects';
  static String session(String sessionId) => '/sessions/$sessionId';
  static const settings = '/settings';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.onboarding,
    debugLogDiagnostics: false,
    routes: [
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(
        path: AppRoutes.connections,
        builder: (_, __) => const ConnectionsListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            builder: (_, __) => const ConnectionFormScreen(),
          ),
          GoRoute(
            path: ':hostId',
            builder: (_, state) =>
                HostDetailScreen(hostId: state.pathParameters['hostId']!),
            routes: [
              GoRoute(
                path: 'install',
                builder: (_, state) => AgentInstallWizardScreen(
                  hostId: state.pathParameters['hostId']!,
                  initialKind: state.uri.queryParameters['kind'],
                ),
              ),
              GoRoute(
                path: 'projects',
                builder: (_, state) => ProjectsScreen(
                  hostId: state.pathParameters['hostId']!,
                ),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/sessions/:sessionId',
        builder: (_, state) =>
            SessionScreen(sessionId: state.pathParameters['sessionId']!),
      ),
      GoRoute(
        path: AppRoutes.settings,
        builder: (_, __) => const SettingsScreen(),
      ),
    ],
    errorBuilder: (_, state) => Scaffold(
      body: Center(child: Text('Ruta no encontrada: ${state.uri}')),
    ),
  );
});

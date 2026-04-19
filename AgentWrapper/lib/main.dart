import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      // Database / heavy services should be overridden here once their
      // initialization is wired (see core/di/providers.dart).
      child: AgentWrapperApp(),
    ),
  );
}

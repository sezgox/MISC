import 'package:agent_wrapper/app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('app boots into onboarding', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: AgentWrapperApp()));
    await tester.pump();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';

import 'app_database.dart';

/// Opens the Drift database with a platform-appropriate executor.
///
/// Wired into Riverpod via `core/di/providers.dart` overrides at app startup.
Future<AppDatabase> openAppDatabase() async {
  final dir = await getApplicationDocumentsDirectory();
  final file = File(p.join(dir.path, 'agent_wrapper.sqlite'));
  await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
  return AppDatabase(NativeDatabase.createInBackground(file));
}

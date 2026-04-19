import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';

import 'app_database.dart';

/// Opens the Drift database stored under the app's documents directory.
///
/// Called once from `main.dart` before `runApp` so that every provider can
/// assume a ready database exists (no async gates in the widget tree).
Future<AppDatabase> openAppDatabase() async {
  // Android needs the sqlite3 NDK library bundled by sqlite3_flutter_libs.
  await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
  final dir = await getApplicationDocumentsDirectory();
  final dbFile = File(p.join(dir.path, 'agentwrapper.sqlite'));
  return AppDatabase(NativeDatabase.createInBackground(dbFile));
}

/// Opens an in-memory database. Useful for tests and integration checks that
/// don't want to touch the real filesystem.
AppDatabase openInMemoryAppDatabase() {
  return AppDatabase(DatabaseConnection(NativeDatabase.memory()));
}

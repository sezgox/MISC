import 'package:drift/drift.dart';

import 'tables.dart';

part 'app_database.g.dart';

/// Drift database. Schema lives in [tables.dart]; DAOs in `daos/`.
///
/// To regenerate the `.g.dart` file run:
///   `dart run build_runner build --delete-conflicting-outputs`
@DriftDatabase(tables: [
  RemoteHosts,
  Projects,
  AgentInstallations,
  Sessions,
  Messages,
  HandoffEvents,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (m) async {
          await m.createAll();
        },
        onUpgrade: (m, from, to) async {
          // TODO(persistence): wire incremental migrations here.
        },
      );
}

import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../services/persistence/app_database.dart';

class ProjectsRepository {
  ProjectsRepository(this._db);
  final AppDatabase _db;
  static const _uuid = Uuid();

  Stream<List<Project>> watchForHost(String hostId) {
    return (_db.select(_db.projects)..where((t) => t.hostId.equals(hostId)))
        .watch();
  }

  Future<List<Project>> getForHost(String hostId) {
    return (_db.select(_db.projects)..where((t) => t.hostId.equals(hostId)))
        .get();
  }

  Future<Project?> getById(String projectId) {
    return (_db.select(_db.projects)..where((t) => t.id.equals(projectId)))
        .getSingleOrNull();
  }

  Future<Project> create({
    required String hostId,
    required String path,
    String? label,
    bool favorite = false,
  }) async {
    final id = 'proj_${_uuid.v4()}';
    final now = DateTime.now();
    await _db.into(_db.projects).insert(
          ProjectsCompanion.insert(
            id: id,
            hostId: hostId,
            path: path,
            label: Value(label),
            favorite: Value(favorite),
            createdAt: now,
          ),
        );
    return (await getById(id))!;
  }

  Future<void> toggleFavorite(String projectId) async {
    final p = await getById(projectId);
    if (p == null) return;
    await (_db.update(_db.projects)..where((t) => t.id.equals(projectId)))
        .write(ProjectsCompanion(favorite: Value(!p.favorite)));
  }

  Future<void> delete(String projectId) async {
    await (_db.delete(_db.projects)..where((t) => t.id.equals(projectId))).go();
  }
}

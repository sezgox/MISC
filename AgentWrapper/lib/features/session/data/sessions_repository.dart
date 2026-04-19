import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../services/persistence/app_database.dart';
import '../../agents/domain/agent_kind.dart';

class SessionsRepository {
  SessionsRepository(this._db);
  final AppDatabase _db;
  static const _uuid = Uuid();

  Future<Session> create({
    required String hostId,
    required AgentKind agentKind,
    String? projectId,
    String? title,
  }) async {
    final id = 'sess_${_uuid.v4()}';
    final now = DateTime.now();
    await _db.into(_db.sessions).insert(
          SessionsCompanion.insert(
            id: id,
            hostId: hostId,
            projectId: Value(projectId),
            agentKind: agentKind.id,
            title: Value(title),
            createdAt: now,
            updatedAt: now,
          ),
        );
    return (await getById(id))!;
  }

  Future<Session?> getById(String id) {
    return (_db.select(_db.sessions)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  Stream<List<Session>> watchForHost(String hostId) {
    return (_db.select(_db.sessions)
          ..where((t) => t.hostId.equals(hostId) & t.archived.equals(false))
          ..orderBy([(t) => OrderingTerm.desc(t.updatedAt)]))
        .watch();
  }

  Future<void> setAgent(String sessionId, AgentKind agentKind) async {
    await (_db.update(_db.sessions)..where((t) => t.id.equals(sessionId))).write(
      SessionsCompanion(
        agentKind: Value(agentKind.id),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }

  Future<void> archive(String sessionId) async {
    await (_db.update(_db.sessions)..where((t) => t.id.equals(sessionId))).write(
      const SessionsCompanion(archived: Value(true)),
    );
  }

  // -------------------- Messages --------------------

  Future<Message> appendMessage({
    required String sessionId,
    required String role,
    required String kind,
    required String content,
    Map<String, String>? metadata,
  }) async {
    final id = 'msg_${_uuid.v4()}';
    final now = DateTime.now();
    final metaJson = metadata == null || metadata.isEmpty
        ? null
        : _encodeMetadata(metadata);
    await _db.into(_db.messages).insert(
          MessagesCompanion.insert(
            id: id,
            sessionId: sessionId,
            role: role,
            kind: kind,
            content: content,
            metadataJson: Value(metaJson),
            createdAt: now,
          ),
        );
    await (_db.update(_db.sessions)..where((t) => t.id.equals(sessionId)))
        .write(SessionsCompanion(updatedAt: Value(now)));
    return (await (_db.select(_db.messages)..where((t) => t.id.equals(id)))
        .getSingle());
  }

  Stream<List<Message>> watchMessages(String sessionId) {
    return (_db.select(_db.messages)
          ..where((t) => t.sessionId.equals(sessionId))
          ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
        .watch();
  }

  Future<List<Message>> loadMessages(String sessionId) {
    return (_db.select(_db.messages)
          ..where((t) => t.sessionId.equals(sessionId))
          ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
        .get();
  }

  // -------------------- Handoff events --------------------

  Future<void> recordHandoff({
    required String sessionId,
    required AgentKind from,
    required AgentKind to,
    required String prompt,
  }) async {
    final id = 'hand_${_uuid.v4()}';
    await _db.into(_db.handoffEvents).insert(
          HandoffEventsCompanion.insert(
            id: id,
            sessionId: sessionId,
            fromAgent: from.id,
            toAgent: to.id,
            prompt: prompt,
            createdAt: DateTime.now(),
          ),
        );
  }

  String _encodeMetadata(Map<String, String> meta) {
    // Tiny k=v encoder so we don't pull a JSON dependency here; the keys we
    // use (language, path, url, level) are safe ASCII.
    return meta.entries.map((e) => '${e.key}=${e.value}').join('\n');
  }

  /// Decodes metadata stored as `k=v\n...` back to a map. Empty keys yield an
  /// empty map.
  static Map<String, String> decodeMetadata(String? raw) {
    if (raw == null || raw.isEmpty) return const {};
    final out = <String, String>{};
    for (final line in raw.split('\n')) {
      final eq = line.indexOf('=');
      if (eq <= 0) continue;
      out[line.substring(0, eq)] = line.substring(eq + 1);
    }
    return out;
  }
}

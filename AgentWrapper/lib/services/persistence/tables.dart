import 'package:drift/drift.dart';

/// All persisted tables for AgentWrapper.
///
/// Important: secret material (passwords, key contents, OAuth tokens) is
/// NEVER stored here. We only store an opaque `credentialRef` that the
/// secure-storage layer can resolve.

class RemoteHosts extends Table {
  TextColumn get id => text()();
  TextColumn get alias => text().withLength(min: 1, max: 80)();
  TextColumn get host => text()();
  IntColumn get port => integer().withDefault(const Constant(22))();
  TextColumn get username => text()();
  TextColumn get authKind => text()(); // 'password' | 'privateKey'
  TextColumn get credentialRef => text()();
  TextColumn get knownHostFingerprint => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get lastUsedAt => dateTime().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Projects extends Table {
  TextColumn get id => text()();
  TextColumn get hostId => text().references(RemoteHosts, #id)();
  TextColumn get path => text()();
  TextColumn get label => text().nullable()();
  TextColumn get color => text().nullable()();
  BoolColumn get favorite => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class AgentInstallations extends Table {
  TextColumn get id => text()();
  TextColumn get hostId => text().references(RemoteHosts, #id)();
  TextColumn get agentKind => text()(); // see AgentKind
  TextColumn get status => text()(); // 'detected' | 'installing' | 'ready' | 'failed'
  TextColumn get version => text().nullable()();
  DateTimeColumn get installedAt => dateTime().nullable()();
  DateTimeColumn get lastCheckAt => dateTime().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Sessions extends Table {
  TextColumn get id => text()();
  TextColumn get hostId => text().references(RemoteHosts, #id)();
  TextColumn get projectId => text().nullable().references(Projects, #id)();
  TextColumn get agentKind => text()();
  TextColumn get title => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get archived => boolean().withDefault(const Constant(false))();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class Messages extends Table {
  TextColumn get id => text()();
  TextColumn get sessionId => text().references(Sessions, #id)();
  TextColumn get role => text()(); // 'user' | 'agent' | 'system'
  TextColumn get kind => text()(); // 'text' | 'code' | 'diff' | 'log' | 'terminal' | 'handoff'
  TextColumn get content => text()();
  TextColumn get metadataJson => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

class HandoffEvents extends Table {
  TextColumn get id => text()();
  TextColumn get sessionId => text().references(Sessions, #id)();
  TextColumn get fromAgent => text()();
  TextColumn get toAgent => text()();
  TextColumn get prompt => text()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}

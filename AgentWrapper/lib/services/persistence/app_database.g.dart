// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $RemoteHostsTable extends RemoteHosts
    with TableInfo<$RemoteHostsTable, RemoteHost> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RemoteHostsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _aliasMeta = const VerificationMeta('alias');
  @override
  late final GeneratedColumn<String> alias = GeneratedColumn<String>(
      'alias', aliasedName, false,
      additionalChecks:
          GeneratedColumn.checkTextLength(minTextLength: 1, maxTextLength: 80),
      type: DriftSqlType.string,
      requiredDuringInsert: true);
  static const VerificationMeta _hostMeta = const VerificationMeta('host');
  @override
  late final GeneratedColumn<String> host = GeneratedColumn<String>(
      'host', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _portMeta = const VerificationMeta('port');
  @override
  late final GeneratedColumn<int> port = GeneratedColumn<int>(
      'port', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(22));
  static const VerificationMeta _usernameMeta =
      const VerificationMeta('username');
  @override
  late final GeneratedColumn<String> username = GeneratedColumn<String>(
      'username', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _authKindMeta =
      const VerificationMeta('authKind');
  @override
  late final GeneratedColumn<String> authKind = GeneratedColumn<String>(
      'auth_kind', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _credentialRefMeta =
      const VerificationMeta('credentialRef');
  @override
  late final GeneratedColumn<String> credentialRef = GeneratedColumn<String>(
      'credential_ref', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _knownHostFingerprintMeta =
      const VerificationMeta('knownHostFingerprint');
  @override
  late final GeneratedColumn<String> knownHostFingerprint =
      GeneratedColumn<String>('known_host_fingerprint', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _lastUsedAtMeta =
      const VerificationMeta('lastUsedAt');
  @override
  late final GeneratedColumn<DateTime> lastUsedAt = GeneratedColumn<DateTime>(
      'last_used_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        alias,
        host,
        port,
        username,
        authKind,
        credentialRef,
        knownHostFingerprint,
        createdAt,
        lastUsedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'remote_hosts';
  @override
  VerificationContext validateIntegrity(Insertable<RemoteHost> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('alias')) {
      context.handle(
          _aliasMeta, alias.isAcceptableOrUnknown(data['alias']!, _aliasMeta));
    } else if (isInserting) {
      context.missing(_aliasMeta);
    }
    if (data.containsKey('host')) {
      context.handle(
          _hostMeta, host.isAcceptableOrUnknown(data['host']!, _hostMeta));
    } else if (isInserting) {
      context.missing(_hostMeta);
    }
    if (data.containsKey('port')) {
      context.handle(
          _portMeta, port.isAcceptableOrUnknown(data['port']!, _portMeta));
    }
    if (data.containsKey('username')) {
      context.handle(_usernameMeta,
          username.isAcceptableOrUnknown(data['username']!, _usernameMeta));
    } else if (isInserting) {
      context.missing(_usernameMeta);
    }
    if (data.containsKey('auth_kind')) {
      context.handle(_authKindMeta,
          authKind.isAcceptableOrUnknown(data['auth_kind']!, _authKindMeta));
    } else if (isInserting) {
      context.missing(_authKindMeta);
    }
    if (data.containsKey('credential_ref')) {
      context.handle(
          _credentialRefMeta,
          credentialRef.isAcceptableOrUnknown(
              data['credential_ref']!, _credentialRefMeta));
    } else if (isInserting) {
      context.missing(_credentialRefMeta);
    }
    if (data.containsKey('known_host_fingerprint')) {
      context.handle(
          _knownHostFingerprintMeta,
          knownHostFingerprint.isAcceptableOrUnknown(
              data['known_host_fingerprint']!, _knownHostFingerprintMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('last_used_at')) {
      context.handle(
          _lastUsedAtMeta,
          lastUsedAt.isAcceptableOrUnknown(
              data['last_used_at']!, _lastUsedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  RemoteHost map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return RemoteHost(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      alias: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}alias'])!,
      host: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}host'])!,
      port: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}port'])!,
      username: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}username'])!,
      authKind: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}auth_kind'])!,
      credentialRef: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}credential_ref'])!,
      knownHostFingerprint: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}known_host_fingerprint']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      lastUsedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_used_at']),
    );
  }

  @override
  $RemoteHostsTable createAlias(String alias) {
    return $RemoteHostsTable(attachedDatabase, alias);
  }
}

class RemoteHost extends DataClass implements Insertable<RemoteHost> {
  final String id;
  final String alias;
  final String host;
  final int port;
  final String username;
  final String authKind;
  final String credentialRef;
  final String? knownHostFingerprint;
  final DateTime createdAt;
  final DateTime? lastUsedAt;
  const RemoteHost(
      {required this.id,
      required this.alias,
      required this.host,
      required this.port,
      required this.username,
      required this.authKind,
      required this.credentialRef,
      this.knownHostFingerprint,
      required this.createdAt,
      this.lastUsedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['alias'] = Variable<String>(alias);
    map['host'] = Variable<String>(host);
    map['port'] = Variable<int>(port);
    map['username'] = Variable<String>(username);
    map['auth_kind'] = Variable<String>(authKind);
    map['credential_ref'] = Variable<String>(credentialRef);
    if (!nullToAbsent || knownHostFingerprint != null) {
      map['known_host_fingerprint'] = Variable<String>(knownHostFingerprint);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    if (!nullToAbsent || lastUsedAt != null) {
      map['last_used_at'] = Variable<DateTime>(lastUsedAt);
    }
    return map;
  }

  RemoteHostsCompanion toCompanion(bool nullToAbsent) {
    return RemoteHostsCompanion(
      id: Value(id),
      alias: Value(alias),
      host: Value(host),
      port: Value(port),
      username: Value(username),
      authKind: Value(authKind),
      credentialRef: Value(credentialRef),
      knownHostFingerprint: knownHostFingerprint == null && nullToAbsent
          ? const Value.absent()
          : Value(knownHostFingerprint),
      createdAt: Value(createdAt),
      lastUsedAt: lastUsedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastUsedAt),
    );
  }

  factory RemoteHost.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return RemoteHost(
      id: serializer.fromJson<String>(json['id']),
      alias: serializer.fromJson<String>(json['alias']),
      host: serializer.fromJson<String>(json['host']),
      port: serializer.fromJson<int>(json['port']),
      username: serializer.fromJson<String>(json['username']),
      authKind: serializer.fromJson<String>(json['authKind']),
      credentialRef: serializer.fromJson<String>(json['credentialRef']),
      knownHostFingerprint:
          serializer.fromJson<String?>(json['knownHostFingerprint']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      lastUsedAt: serializer.fromJson<DateTime?>(json['lastUsedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'alias': serializer.toJson<String>(alias),
      'host': serializer.toJson<String>(host),
      'port': serializer.toJson<int>(port),
      'username': serializer.toJson<String>(username),
      'authKind': serializer.toJson<String>(authKind),
      'credentialRef': serializer.toJson<String>(credentialRef),
      'knownHostFingerprint': serializer.toJson<String?>(knownHostFingerprint),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'lastUsedAt': serializer.toJson<DateTime?>(lastUsedAt),
    };
  }

  RemoteHost copyWith(
          {String? id,
          String? alias,
          String? host,
          int? port,
          String? username,
          String? authKind,
          String? credentialRef,
          Value<String?> knownHostFingerprint = const Value.absent(),
          DateTime? createdAt,
          Value<DateTime?> lastUsedAt = const Value.absent()}) =>
      RemoteHost(
        id: id ?? this.id,
        alias: alias ?? this.alias,
        host: host ?? this.host,
        port: port ?? this.port,
        username: username ?? this.username,
        authKind: authKind ?? this.authKind,
        credentialRef: credentialRef ?? this.credentialRef,
        knownHostFingerprint: knownHostFingerprint.present
            ? knownHostFingerprint.value
            : this.knownHostFingerprint,
        createdAt: createdAt ?? this.createdAt,
        lastUsedAt: lastUsedAt.present ? lastUsedAt.value : this.lastUsedAt,
      );
  RemoteHost copyWithCompanion(RemoteHostsCompanion data) {
    return RemoteHost(
      id: data.id.present ? data.id.value : this.id,
      alias: data.alias.present ? data.alias.value : this.alias,
      host: data.host.present ? data.host.value : this.host,
      port: data.port.present ? data.port.value : this.port,
      username: data.username.present ? data.username.value : this.username,
      authKind: data.authKind.present ? data.authKind.value : this.authKind,
      credentialRef: data.credentialRef.present
          ? data.credentialRef.value
          : this.credentialRef,
      knownHostFingerprint: data.knownHostFingerprint.present
          ? data.knownHostFingerprint.value
          : this.knownHostFingerprint,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      lastUsedAt:
          data.lastUsedAt.present ? data.lastUsedAt.value : this.lastUsedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('RemoteHost(')
          ..write('id: $id, ')
          ..write('alias: $alias, ')
          ..write('host: $host, ')
          ..write('port: $port, ')
          ..write('username: $username, ')
          ..write('authKind: $authKind, ')
          ..write('credentialRef: $credentialRef, ')
          ..write('knownHostFingerprint: $knownHostFingerprint, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastUsedAt: $lastUsedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, alias, host, port, username, authKind,
      credentialRef, knownHostFingerprint, createdAt, lastUsedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is RemoteHost &&
          other.id == this.id &&
          other.alias == this.alias &&
          other.host == this.host &&
          other.port == this.port &&
          other.username == this.username &&
          other.authKind == this.authKind &&
          other.credentialRef == this.credentialRef &&
          other.knownHostFingerprint == this.knownHostFingerprint &&
          other.createdAt == this.createdAt &&
          other.lastUsedAt == this.lastUsedAt);
}

class RemoteHostsCompanion extends UpdateCompanion<RemoteHost> {
  final Value<String> id;
  final Value<String> alias;
  final Value<String> host;
  final Value<int> port;
  final Value<String> username;
  final Value<String> authKind;
  final Value<String> credentialRef;
  final Value<String?> knownHostFingerprint;
  final Value<DateTime> createdAt;
  final Value<DateTime?> lastUsedAt;
  final Value<int> rowid;
  const RemoteHostsCompanion({
    this.id = const Value.absent(),
    this.alias = const Value.absent(),
    this.host = const Value.absent(),
    this.port = const Value.absent(),
    this.username = const Value.absent(),
    this.authKind = const Value.absent(),
    this.credentialRef = const Value.absent(),
    this.knownHostFingerprint = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastUsedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  RemoteHostsCompanion.insert({
    required String id,
    required String alias,
    required String host,
    this.port = const Value.absent(),
    required String username,
    required String authKind,
    required String credentialRef,
    this.knownHostFingerprint = const Value.absent(),
    required DateTime createdAt,
    this.lastUsedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        alias = Value(alias),
        host = Value(host),
        username = Value(username),
        authKind = Value(authKind),
        credentialRef = Value(credentialRef),
        createdAt = Value(createdAt);
  static Insertable<RemoteHost> custom({
    Expression<String>? id,
    Expression<String>? alias,
    Expression<String>? host,
    Expression<int>? port,
    Expression<String>? username,
    Expression<String>? authKind,
    Expression<String>? credentialRef,
    Expression<String>? knownHostFingerprint,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? lastUsedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (alias != null) 'alias': alias,
      if (host != null) 'host': host,
      if (port != null) 'port': port,
      if (username != null) 'username': username,
      if (authKind != null) 'auth_kind': authKind,
      if (credentialRef != null) 'credential_ref': credentialRef,
      if (knownHostFingerprint != null)
        'known_host_fingerprint': knownHostFingerprint,
      if (createdAt != null) 'created_at': createdAt,
      if (lastUsedAt != null) 'last_used_at': lastUsedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  RemoteHostsCompanion copyWith(
      {Value<String>? id,
      Value<String>? alias,
      Value<String>? host,
      Value<int>? port,
      Value<String>? username,
      Value<String>? authKind,
      Value<String>? credentialRef,
      Value<String?>? knownHostFingerprint,
      Value<DateTime>? createdAt,
      Value<DateTime?>? lastUsedAt,
      Value<int>? rowid}) {
    return RemoteHostsCompanion(
      id: id ?? this.id,
      alias: alias ?? this.alias,
      host: host ?? this.host,
      port: port ?? this.port,
      username: username ?? this.username,
      authKind: authKind ?? this.authKind,
      credentialRef: credentialRef ?? this.credentialRef,
      knownHostFingerprint: knownHostFingerprint ?? this.knownHostFingerprint,
      createdAt: createdAt ?? this.createdAt,
      lastUsedAt: lastUsedAt ?? this.lastUsedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (alias.present) {
      map['alias'] = Variable<String>(alias.value);
    }
    if (host.present) {
      map['host'] = Variable<String>(host.value);
    }
    if (port.present) {
      map['port'] = Variable<int>(port.value);
    }
    if (username.present) {
      map['username'] = Variable<String>(username.value);
    }
    if (authKind.present) {
      map['auth_kind'] = Variable<String>(authKind.value);
    }
    if (credentialRef.present) {
      map['credential_ref'] = Variable<String>(credentialRef.value);
    }
    if (knownHostFingerprint.present) {
      map['known_host_fingerprint'] =
          Variable<String>(knownHostFingerprint.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (lastUsedAt.present) {
      map['last_used_at'] = Variable<DateTime>(lastUsedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('RemoteHostsCompanion(')
          ..write('id: $id, ')
          ..write('alias: $alias, ')
          ..write('host: $host, ')
          ..write('port: $port, ')
          ..write('username: $username, ')
          ..write('authKind: $authKind, ')
          ..write('credentialRef: $credentialRef, ')
          ..write('knownHostFingerprint: $knownHostFingerprint, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastUsedAt: $lastUsedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ProjectsTable extends Projects with TableInfo<$ProjectsTable, Project> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProjectsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _hostIdMeta = const VerificationMeta('hostId');
  @override
  late final GeneratedColumn<String> hostId = GeneratedColumn<String>(
      'host_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES remote_hosts (id)'));
  static const VerificationMeta _pathMeta = const VerificationMeta('path');
  @override
  late final GeneratedColumn<String> path = GeneratedColumn<String>(
      'path', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _labelMeta = const VerificationMeta('label');
  @override
  late final GeneratedColumn<String> label = GeneratedColumn<String>(
      'label', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _colorMeta = const VerificationMeta('color');
  @override
  late final GeneratedColumn<String> color = GeneratedColumn<String>(
      'color', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _favoriteMeta =
      const VerificationMeta('favorite');
  @override
  late final GeneratedColumn<bool> favorite = GeneratedColumn<bool>(
      'favorite', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("favorite" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns =>
      [id, hostId, path, label, color, favorite, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'projects';
  @override
  VerificationContext validateIntegrity(Insertable<Project> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('host_id')) {
      context.handle(_hostIdMeta,
          hostId.isAcceptableOrUnknown(data['host_id']!, _hostIdMeta));
    } else if (isInserting) {
      context.missing(_hostIdMeta);
    }
    if (data.containsKey('path')) {
      context.handle(
          _pathMeta, path.isAcceptableOrUnknown(data['path']!, _pathMeta));
    } else if (isInserting) {
      context.missing(_pathMeta);
    }
    if (data.containsKey('label')) {
      context.handle(
          _labelMeta, label.isAcceptableOrUnknown(data['label']!, _labelMeta));
    }
    if (data.containsKey('color')) {
      context.handle(
          _colorMeta, color.isAcceptableOrUnknown(data['color']!, _colorMeta));
    }
    if (data.containsKey('favorite')) {
      context.handle(_favoriteMeta,
          favorite.isAcceptableOrUnknown(data['favorite']!, _favoriteMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Project map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Project(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      hostId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}host_id'])!,
      path: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}path'])!,
      label: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}label']),
      color: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}color']),
      favorite: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}favorite'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $ProjectsTable createAlias(String alias) {
    return $ProjectsTable(attachedDatabase, alias);
  }
}

class Project extends DataClass implements Insertable<Project> {
  final String id;
  final String hostId;
  final String path;
  final String? label;
  final String? color;
  final bool favorite;
  final DateTime createdAt;
  const Project(
      {required this.id,
      required this.hostId,
      required this.path,
      this.label,
      this.color,
      required this.favorite,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['host_id'] = Variable<String>(hostId);
    map['path'] = Variable<String>(path);
    if (!nullToAbsent || label != null) {
      map['label'] = Variable<String>(label);
    }
    if (!nullToAbsent || color != null) {
      map['color'] = Variable<String>(color);
    }
    map['favorite'] = Variable<bool>(favorite);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  ProjectsCompanion toCompanion(bool nullToAbsent) {
    return ProjectsCompanion(
      id: Value(id),
      hostId: Value(hostId),
      path: Value(path),
      label:
          label == null && nullToAbsent ? const Value.absent() : Value(label),
      color:
          color == null && nullToAbsent ? const Value.absent() : Value(color),
      favorite: Value(favorite),
      createdAt: Value(createdAt),
    );
  }

  factory Project.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Project(
      id: serializer.fromJson<String>(json['id']),
      hostId: serializer.fromJson<String>(json['hostId']),
      path: serializer.fromJson<String>(json['path']),
      label: serializer.fromJson<String?>(json['label']),
      color: serializer.fromJson<String?>(json['color']),
      favorite: serializer.fromJson<bool>(json['favorite']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'hostId': serializer.toJson<String>(hostId),
      'path': serializer.toJson<String>(path),
      'label': serializer.toJson<String?>(label),
      'color': serializer.toJson<String?>(color),
      'favorite': serializer.toJson<bool>(favorite),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  Project copyWith(
          {String? id,
          String? hostId,
          String? path,
          Value<String?> label = const Value.absent(),
          Value<String?> color = const Value.absent(),
          bool? favorite,
          DateTime? createdAt}) =>
      Project(
        id: id ?? this.id,
        hostId: hostId ?? this.hostId,
        path: path ?? this.path,
        label: label.present ? label.value : this.label,
        color: color.present ? color.value : this.color,
        favorite: favorite ?? this.favorite,
        createdAt: createdAt ?? this.createdAt,
      );
  Project copyWithCompanion(ProjectsCompanion data) {
    return Project(
      id: data.id.present ? data.id.value : this.id,
      hostId: data.hostId.present ? data.hostId.value : this.hostId,
      path: data.path.present ? data.path.value : this.path,
      label: data.label.present ? data.label.value : this.label,
      color: data.color.present ? data.color.value : this.color,
      favorite: data.favorite.present ? data.favorite.value : this.favorite,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Project(')
          ..write('id: $id, ')
          ..write('hostId: $hostId, ')
          ..write('path: $path, ')
          ..write('label: $label, ')
          ..write('color: $color, ')
          ..write('favorite: $favorite, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, hostId, path, label, color, favorite, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Project &&
          other.id == this.id &&
          other.hostId == this.hostId &&
          other.path == this.path &&
          other.label == this.label &&
          other.color == this.color &&
          other.favorite == this.favorite &&
          other.createdAt == this.createdAt);
}

class ProjectsCompanion extends UpdateCompanion<Project> {
  final Value<String> id;
  final Value<String> hostId;
  final Value<String> path;
  final Value<String?> label;
  final Value<String?> color;
  final Value<bool> favorite;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const ProjectsCompanion({
    this.id = const Value.absent(),
    this.hostId = const Value.absent(),
    this.path = const Value.absent(),
    this.label = const Value.absent(),
    this.color = const Value.absent(),
    this.favorite = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ProjectsCompanion.insert({
    required String id,
    required String hostId,
    required String path,
    this.label = const Value.absent(),
    this.color = const Value.absent(),
    this.favorite = const Value.absent(),
    required DateTime createdAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        hostId = Value(hostId),
        path = Value(path),
        createdAt = Value(createdAt);
  static Insertable<Project> custom({
    Expression<String>? id,
    Expression<String>? hostId,
    Expression<String>? path,
    Expression<String>? label,
    Expression<String>? color,
    Expression<bool>? favorite,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (hostId != null) 'host_id': hostId,
      if (path != null) 'path': path,
      if (label != null) 'label': label,
      if (color != null) 'color': color,
      if (favorite != null) 'favorite': favorite,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ProjectsCompanion copyWith(
      {Value<String>? id,
      Value<String>? hostId,
      Value<String>? path,
      Value<String?>? label,
      Value<String?>? color,
      Value<bool>? favorite,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return ProjectsCompanion(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      path: path ?? this.path,
      label: label ?? this.label,
      color: color ?? this.color,
      favorite: favorite ?? this.favorite,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (hostId.present) {
      map['host_id'] = Variable<String>(hostId.value);
    }
    if (path.present) {
      map['path'] = Variable<String>(path.value);
    }
    if (label.present) {
      map['label'] = Variable<String>(label.value);
    }
    if (color.present) {
      map['color'] = Variable<String>(color.value);
    }
    if (favorite.present) {
      map['favorite'] = Variable<bool>(favorite.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ProjectsCompanion(')
          ..write('id: $id, ')
          ..write('hostId: $hostId, ')
          ..write('path: $path, ')
          ..write('label: $label, ')
          ..write('color: $color, ')
          ..write('favorite: $favorite, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AgentInstallationsTable extends AgentInstallations
    with TableInfo<$AgentInstallationsTable, AgentInstallation> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AgentInstallationsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _hostIdMeta = const VerificationMeta('hostId');
  @override
  late final GeneratedColumn<String> hostId = GeneratedColumn<String>(
      'host_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES remote_hosts (id)'));
  static const VerificationMeta _agentKindMeta =
      const VerificationMeta('agentKind');
  @override
  late final GeneratedColumn<String> agentKind = GeneratedColumn<String>(
      'agent_kind', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _versionMeta =
      const VerificationMeta('version');
  @override
  late final GeneratedColumn<String> version = GeneratedColumn<String>(
      'version', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _installedAtMeta =
      const VerificationMeta('installedAt');
  @override
  late final GeneratedColumn<DateTime> installedAt = GeneratedColumn<DateTime>(
      'installed_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastCheckAtMeta =
      const VerificationMeta('lastCheckAt');
  @override
  late final GeneratedColumn<DateTime> lastCheckAt = GeneratedColumn<DateTime>(
      'last_check_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns =>
      [id, hostId, agentKind, status, version, installedAt, lastCheckAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'agent_installations';
  @override
  VerificationContext validateIntegrity(Insertable<AgentInstallation> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('host_id')) {
      context.handle(_hostIdMeta,
          hostId.isAcceptableOrUnknown(data['host_id']!, _hostIdMeta));
    } else if (isInserting) {
      context.missing(_hostIdMeta);
    }
    if (data.containsKey('agent_kind')) {
      context.handle(_agentKindMeta,
          agentKind.isAcceptableOrUnknown(data['agent_kind']!, _agentKindMeta));
    } else if (isInserting) {
      context.missing(_agentKindMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('version')) {
      context.handle(_versionMeta,
          version.isAcceptableOrUnknown(data['version']!, _versionMeta));
    }
    if (data.containsKey('installed_at')) {
      context.handle(
          _installedAtMeta,
          installedAt.isAcceptableOrUnknown(
              data['installed_at']!, _installedAtMeta));
    }
    if (data.containsKey('last_check_at')) {
      context.handle(
          _lastCheckAtMeta,
          lastCheckAt.isAcceptableOrUnknown(
              data['last_check_at']!, _lastCheckAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AgentInstallation map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AgentInstallation(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      hostId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}host_id'])!,
      agentKind: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}agent_kind'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      version: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}version']),
      installedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}installed_at']),
      lastCheckAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_check_at']),
    );
  }

  @override
  $AgentInstallationsTable createAlias(String alias) {
    return $AgentInstallationsTable(attachedDatabase, alias);
  }
}

class AgentInstallation extends DataClass
    implements Insertable<AgentInstallation> {
  final String id;
  final String hostId;
  final String agentKind;
  final String status;
  final String? version;
  final DateTime? installedAt;
  final DateTime? lastCheckAt;
  const AgentInstallation(
      {required this.id,
      required this.hostId,
      required this.agentKind,
      required this.status,
      this.version,
      this.installedAt,
      this.lastCheckAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['host_id'] = Variable<String>(hostId);
    map['agent_kind'] = Variable<String>(agentKind);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || version != null) {
      map['version'] = Variable<String>(version);
    }
    if (!nullToAbsent || installedAt != null) {
      map['installed_at'] = Variable<DateTime>(installedAt);
    }
    if (!nullToAbsent || lastCheckAt != null) {
      map['last_check_at'] = Variable<DateTime>(lastCheckAt);
    }
    return map;
  }

  AgentInstallationsCompanion toCompanion(bool nullToAbsent) {
    return AgentInstallationsCompanion(
      id: Value(id),
      hostId: Value(hostId),
      agentKind: Value(agentKind),
      status: Value(status),
      version: version == null && nullToAbsent
          ? const Value.absent()
          : Value(version),
      installedAt: installedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(installedAt),
      lastCheckAt: lastCheckAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastCheckAt),
    );
  }

  factory AgentInstallation.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AgentInstallation(
      id: serializer.fromJson<String>(json['id']),
      hostId: serializer.fromJson<String>(json['hostId']),
      agentKind: serializer.fromJson<String>(json['agentKind']),
      status: serializer.fromJson<String>(json['status']),
      version: serializer.fromJson<String?>(json['version']),
      installedAt: serializer.fromJson<DateTime?>(json['installedAt']),
      lastCheckAt: serializer.fromJson<DateTime?>(json['lastCheckAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'hostId': serializer.toJson<String>(hostId),
      'agentKind': serializer.toJson<String>(agentKind),
      'status': serializer.toJson<String>(status),
      'version': serializer.toJson<String?>(version),
      'installedAt': serializer.toJson<DateTime?>(installedAt),
      'lastCheckAt': serializer.toJson<DateTime?>(lastCheckAt),
    };
  }

  AgentInstallation copyWith(
          {String? id,
          String? hostId,
          String? agentKind,
          String? status,
          Value<String?> version = const Value.absent(),
          Value<DateTime?> installedAt = const Value.absent(),
          Value<DateTime?> lastCheckAt = const Value.absent()}) =>
      AgentInstallation(
        id: id ?? this.id,
        hostId: hostId ?? this.hostId,
        agentKind: agentKind ?? this.agentKind,
        status: status ?? this.status,
        version: version.present ? version.value : this.version,
        installedAt: installedAt.present ? installedAt.value : this.installedAt,
        lastCheckAt: lastCheckAt.present ? lastCheckAt.value : this.lastCheckAt,
      );
  AgentInstallation copyWithCompanion(AgentInstallationsCompanion data) {
    return AgentInstallation(
      id: data.id.present ? data.id.value : this.id,
      hostId: data.hostId.present ? data.hostId.value : this.hostId,
      agentKind: data.agentKind.present ? data.agentKind.value : this.agentKind,
      status: data.status.present ? data.status.value : this.status,
      version: data.version.present ? data.version.value : this.version,
      installedAt:
          data.installedAt.present ? data.installedAt.value : this.installedAt,
      lastCheckAt:
          data.lastCheckAt.present ? data.lastCheckAt.value : this.lastCheckAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AgentInstallation(')
          ..write('id: $id, ')
          ..write('hostId: $hostId, ')
          ..write('agentKind: $agentKind, ')
          ..write('status: $status, ')
          ..write('version: $version, ')
          ..write('installedAt: $installedAt, ')
          ..write('lastCheckAt: $lastCheckAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, hostId, agentKind, status, version, installedAt, lastCheckAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AgentInstallation &&
          other.id == this.id &&
          other.hostId == this.hostId &&
          other.agentKind == this.agentKind &&
          other.status == this.status &&
          other.version == this.version &&
          other.installedAt == this.installedAt &&
          other.lastCheckAt == this.lastCheckAt);
}

class AgentInstallationsCompanion extends UpdateCompanion<AgentInstallation> {
  final Value<String> id;
  final Value<String> hostId;
  final Value<String> agentKind;
  final Value<String> status;
  final Value<String?> version;
  final Value<DateTime?> installedAt;
  final Value<DateTime?> lastCheckAt;
  final Value<int> rowid;
  const AgentInstallationsCompanion({
    this.id = const Value.absent(),
    this.hostId = const Value.absent(),
    this.agentKind = const Value.absent(),
    this.status = const Value.absent(),
    this.version = const Value.absent(),
    this.installedAt = const Value.absent(),
    this.lastCheckAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AgentInstallationsCompanion.insert({
    required String id,
    required String hostId,
    required String agentKind,
    required String status,
    this.version = const Value.absent(),
    this.installedAt = const Value.absent(),
    this.lastCheckAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        hostId = Value(hostId),
        agentKind = Value(agentKind),
        status = Value(status);
  static Insertable<AgentInstallation> custom({
    Expression<String>? id,
    Expression<String>? hostId,
    Expression<String>? agentKind,
    Expression<String>? status,
    Expression<String>? version,
    Expression<DateTime>? installedAt,
    Expression<DateTime>? lastCheckAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (hostId != null) 'host_id': hostId,
      if (agentKind != null) 'agent_kind': agentKind,
      if (status != null) 'status': status,
      if (version != null) 'version': version,
      if (installedAt != null) 'installed_at': installedAt,
      if (lastCheckAt != null) 'last_check_at': lastCheckAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AgentInstallationsCompanion copyWith(
      {Value<String>? id,
      Value<String>? hostId,
      Value<String>? agentKind,
      Value<String>? status,
      Value<String?>? version,
      Value<DateTime?>? installedAt,
      Value<DateTime?>? lastCheckAt,
      Value<int>? rowid}) {
    return AgentInstallationsCompanion(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      agentKind: agentKind ?? this.agentKind,
      status: status ?? this.status,
      version: version ?? this.version,
      installedAt: installedAt ?? this.installedAt,
      lastCheckAt: lastCheckAt ?? this.lastCheckAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (hostId.present) {
      map['host_id'] = Variable<String>(hostId.value);
    }
    if (agentKind.present) {
      map['agent_kind'] = Variable<String>(agentKind.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (version.present) {
      map['version'] = Variable<String>(version.value);
    }
    if (installedAt.present) {
      map['installed_at'] = Variable<DateTime>(installedAt.value);
    }
    if (lastCheckAt.present) {
      map['last_check_at'] = Variable<DateTime>(lastCheckAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AgentInstallationsCompanion(')
          ..write('id: $id, ')
          ..write('hostId: $hostId, ')
          ..write('agentKind: $agentKind, ')
          ..write('status: $status, ')
          ..write('version: $version, ')
          ..write('installedAt: $installedAt, ')
          ..write('lastCheckAt: $lastCheckAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SessionsTable extends Sessions with TableInfo<$SessionsTable, Session> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SessionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _hostIdMeta = const VerificationMeta('hostId');
  @override
  late final GeneratedColumn<String> hostId = GeneratedColumn<String>(
      'host_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES remote_hosts (id)'));
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES projects (id)'));
  static const VerificationMeta _agentKindMeta =
      const VerificationMeta('agentKind');
  @override
  late final GeneratedColumn<String> agentKind = GeneratedColumn<String>(
      'agent_kind', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _archivedMeta =
      const VerificationMeta('archived');
  @override
  late final GeneratedColumn<bool> archived = GeneratedColumn<bool>(
      'archived', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("archived" IN (0, 1))'),
      defaultValue: const Constant(false));
  @override
  List<GeneratedColumn> get $columns =>
      [id, hostId, projectId, agentKind, title, createdAt, updatedAt, archived];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sessions';
  @override
  VerificationContext validateIntegrity(Insertable<Session> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('host_id')) {
      context.handle(_hostIdMeta,
          hostId.isAcceptableOrUnknown(data['host_id']!, _hostIdMeta));
    } else if (isInserting) {
      context.missing(_hostIdMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    }
    if (data.containsKey('agent_kind')) {
      context.handle(_agentKindMeta,
          agentKind.isAcceptableOrUnknown(data['agent_kind']!, _agentKindMeta));
    } else if (isInserting) {
      context.missing(_agentKindMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('archived')) {
      context.handle(_archivedMeta,
          archived.isAcceptableOrUnknown(data['archived']!, _archivedMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Session map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Session(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      hostId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}host_id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id']),
      agentKind: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}agent_kind'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      archived: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}archived'])!,
    );
  }

  @override
  $SessionsTable createAlias(String alias) {
    return $SessionsTable(attachedDatabase, alias);
  }
}

class Session extends DataClass implements Insertable<Session> {
  final String id;
  final String hostId;
  final String? projectId;
  final String agentKind;
  final String? title;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool archived;
  const Session(
      {required this.id,
      required this.hostId,
      this.projectId,
      required this.agentKind,
      this.title,
      required this.createdAt,
      required this.updatedAt,
      required this.archived});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['host_id'] = Variable<String>(hostId);
    if (!nullToAbsent || projectId != null) {
      map['project_id'] = Variable<String>(projectId);
    }
    map['agent_kind'] = Variable<String>(agentKind);
    if (!nullToAbsent || title != null) {
      map['title'] = Variable<String>(title);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['archived'] = Variable<bool>(archived);
    return map;
  }

  SessionsCompanion toCompanion(bool nullToAbsent) {
    return SessionsCompanion(
      id: Value(id),
      hostId: Value(hostId),
      projectId: projectId == null && nullToAbsent
          ? const Value.absent()
          : Value(projectId),
      agentKind: Value(agentKind),
      title:
          title == null && nullToAbsent ? const Value.absent() : Value(title),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      archived: Value(archived),
    );
  }

  factory Session.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Session(
      id: serializer.fromJson<String>(json['id']),
      hostId: serializer.fromJson<String>(json['hostId']),
      projectId: serializer.fromJson<String?>(json['projectId']),
      agentKind: serializer.fromJson<String>(json['agentKind']),
      title: serializer.fromJson<String?>(json['title']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      archived: serializer.fromJson<bool>(json['archived']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'hostId': serializer.toJson<String>(hostId),
      'projectId': serializer.toJson<String?>(projectId),
      'agentKind': serializer.toJson<String>(agentKind),
      'title': serializer.toJson<String?>(title),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'archived': serializer.toJson<bool>(archived),
    };
  }

  Session copyWith(
          {String? id,
          String? hostId,
          Value<String?> projectId = const Value.absent(),
          String? agentKind,
          Value<String?> title = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt,
          bool? archived}) =>
      Session(
        id: id ?? this.id,
        hostId: hostId ?? this.hostId,
        projectId: projectId.present ? projectId.value : this.projectId,
        agentKind: agentKind ?? this.agentKind,
        title: title.present ? title.value : this.title,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        archived: archived ?? this.archived,
      );
  Session copyWithCompanion(SessionsCompanion data) {
    return Session(
      id: data.id.present ? data.id.value : this.id,
      hostId: data.hostId.present ? data.hostId.value : this.hostId,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      agentKind: data.agentKind.present ? data.agentKind.value : this.agentKind,
      title: data.title.present ? data.title.value : this.title,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      archived: data.archived.present ? data.archived.value : this.archived,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Session(')
          ..write('id: $id, ')
          ..write('hostId: $hostId, ')
          ..write('projectId: $projectId, ')
          ..write('agentKind: $agentKind, ')
          ..write('title: $title, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('archived: $archived')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id, hostId, projectId, agentKind, title, createdAt, updatedAt, archived);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Session &&
          other.id == this.id &&
          other.hostId == this.hostId &&
          other.projectId == this.projectId &&
          other.agentKind == this.agentKind &&
          other.title == this.title &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.archived == this.archived);
}

class SessionsCompanion extends UpdateCompanion<Session> {
  final Value<String> id;
  final Value<String> hostId;
  final Value<String?> projectId;
  final Value<String> agentKind;
  final Value<String?> title;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<bool> archived;
  final Value<int> rowid;
  const SessionsCompanion({
    this.id = const Value.absent(),
    this.hostId = const Value.absent(),
    this.projectId = const Value.absent(),
    this.agentKind = const Value.absent(),
    this.title = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.archived = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SessionsCompanion.insert({
    required String id,
    required String hostId,
    this.projectId = const Value.absent(),
    required String agentKind,
    this.title = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.archived = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        hostId = Value(hostId),
        agentKind = Value(agentKind),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<Session> custom({
    Expression<String>? id,
    Expression<String>? hostId,
    Expression<String>? projectId,
    Expression<String>? agentKind,
    Expression<String>? title,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<bool>? archived,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (hostId != null) 'host_id': hostId,
      if (projectId != null) 'project_id': projectId,
      if (agentKind != null) 'agent_kind': agentKind,
      if (title != null) 'title': title,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (archived != null) 'archived': archived,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SessionsCompanion copyWith(
      {Value<String>? id,
      Value<String>? hostId,
      Value<String?>? projectId,
      Value<String>? agentKind,
      Value<String?>? title,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<bool>? archived,
      Value<int>? rowid}) {
    return SessionsCompanion(
      id: id ?? this.id,
      hostId: hostId ?? this.hostId,
      projectId: projectId ?? this.projectId,
      agentKind: agentKind ?? this.agentKind,
      title: title ?? this.title,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      archived: archived ?? this.archived,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (hostId.present) {
      map['host_id'] = Variable<String>(hostId.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (agentKind.present) {
      map['agent_kind'] = Variable<String>(agentKind.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (archived.present) {
      map['archived'] = Variable<bool>(archived.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SessionsCompanion(')
          ..write('id: $id, ')
          ..write('hostId: $hostId, ')
          ..write('projectId: $projectId, ')
          ..write('agentKind: $agentKind, ')
          ..write('title: $title, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('archived: $archived, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $MessagesTable extends Messages with TableInfo<$MessagesTable, Message> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $MessagesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sessionIdMeta =
      const VerificationMeta('sessionId');
  @override
  late final GeneratedColumn<String> sessionId = GeneratedColumn<String>(
      'session_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES sessions (id)'));
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _kindMeta = const VerificationMeta('kind');
  @override
  late final GeneratedColumn<String> kind = GeneratedColumn<String>(
      'kind', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _contentMeta =
      const VerificationMeta('content');
  @override
  late final GeneratedColumn<String> content = GeneratedColumn<String>(
      'content', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _metadataJsonMeta =
      const VerificationMeta('metadataJson');
  @override
  late final GeneratedColumn<String> metadataJson = GeneratedColumn<String>(
      'metadata_json', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns =>
      [id, sessionId, role, kind, content, metadataJson, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'messages';
  @override
  VerificationContext validateIntegrity(Insertable<Message> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('session_id')) {
      context.handle(_sessionIdMeta,
          sessionId.isAcceptableOrUnknown(data['session_id']!, _sessionIdMeta));
    } else if (isInserting) {
      context.missing(_sessionIdMeta);
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    } else if (isInserting) {
      context.missing(_roleMeta);
    }
    if (data.containsKey('kind')) {
      context.handle(
          _kindMeta, kind.isAcceptableOrUnknown(data['kind']!, _kindMeta));
    } else if (isInserting) {
      context.missing(_kindMeta);
    }
    if (data.containsKey('content')) {
      context.handle(_contentMeta,
          content.isAcceptableOrUnknown(data['content']!, _contentMeta));
    } else if (isInserting) {
      context.missing(_contentMeta);
    }
    if (data.containsKey('metadata_json')) {
      context.handle(
          _metadataJsonMeta,
          metadataJson.isAcceptableOrUnknown(
              data['metadata_json']!, _metadataJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Message map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Message(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      sessionId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}session_id'])!,
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
      kind: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}kind'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content'])!,
      metadataJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}metadata_json']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $MessagesTable createAlias(String alias) {
    return $MessagesTable(attachedDatabase, alias);
  }
}

class Message extends DataClass implements Insertable<Message> {
  final String id;
  final String sessionId;
  final String role;
  final String kind;
  final String content;
  final String? metadataJson;
  final DateTime createdAt;
  const Message(
      {required this.id,
      required this.sessionId,
      required this.role,
      required this.kind,
      required this.content,
      this.metadataJson,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['session_id'] = Variable<String>(sessionId);
    map['role'] = Variable<String>(role);
    map['kind'] = Variable<String>(kind);
    map['content'] = Variable<String>(content);
    if (!nullToAbsent || metadataJson != null) {
      map['metadata_json'] = Variable<String>(metadataJson);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  MessagesCompanion toCompanion(bool nullToAbsent) {
    return MessagesCompanion(
      id: Value(id),
      sessionId: Value(sessionId),
      role: Value(role),
      kind: Value(kind),
      content: Value(content),
      metadataJson: metadataJson == null && nullToAbsent
          ? const Value.absent()
          : Value(metadataJson),
      createdAt: Value(createdAt),
    );
  }

  factory Message.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Message(
      id: serializer.fromJson<String>(json['id']),
      sessionId: serializer.fromJson<String>(json['sessionId']),
      role: serializer.fromJson<String>(json['role']),
      kind: serializer.fromJson<String>(json['kind']),
      content: serializer.fromJson<String>(json['content']),
      metadataJson: serializer.fromJson<String?>(json['metadataJson']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'sessionId': serializer.toJson<String>(sessionId),
      'role': serializer.toJson<String>(role),
      'kind': serializer.toJson<String>(kind),
      'content': serializer.toJson<String>(content),
      'metadataJson': serializer.toJson<String?>(metadataJson),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  Message copyWith(
          {String? id,
          String? sessionId,
          String? role,
          String? kind,
          String? content,
          Value<String?> metadataJson = const Value.absent(),
          DateTime? createdAt}) =>
      Message(
        id: id ?? this.id,
        sessionId: sessionId ?? this.sessionId,
        role: role ?? this.role,
        kind: kind ?? this.kind,
        content: content ?? this.content,
        metadataJson:
            metadataJson.present ? metadataJson.value : this.metadataJson,
        createdAt: createdAt ?? this.createdAt,
      );
  Message copyWithCompanion(MessagesCompanion data) {
    return Message(
      id: data.id.present ? data.id.value : this.id,
      sessionId: data.sessionId.present ? data.sessionId.value : this.sessionId,
      role: data.role.present ? data.role.value : this.role,
      kind: data.kind.present ? data.kind.value : this.kind,
      content: data.content.present ? data.content.value : this.content,
      metadataJson: data.metadataJson.present
          ? data.metadataJson.value
          : this.metadataJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Message(')
          ..write('id: $id, ')
          ..write('sessionId: $sessionId, ')
          ..write('role: $role, ')
          ..write('kind: $kind, ')
          ..write('content: $content, ')
          ..write('metadataJson: $metadataJson, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, sessionId, role, kind, content, metadataJson, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Message &&
          other.id == this.id &&
          other.sessionId == this.sessionId &&
          other.role == this.role &&
          other.kind == this.kind &&
          other.content == this.content &&
          other.metadataJson == this.metadataJson &&
          other.createdAt == this.createdAt);
}

class MessagesCompanion extends UpdateCompanion<Message> {
  final Value<String> id;
  final Value<String> sessionId;
  final Value<String> role;
  final Value<String> kind;
  final Value<String> content;
  final Value<String?> metadataJson;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const MessagesCompanion({
    this.id = const Value.absent(),
    this.sessionId = const Value.absent(),
    this.role = const Value.absent(),
    this.kind = const Value.absent(),
    this.content = const Value.absent(),
    this.metadataJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  MessagesCompanion.insert({
    required String id,
    required String sessionId,
    required String role,
    required String kind,
    required String content,
    this.metadataJson = const Value.absent(),
    required DateTime createdAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        sessionId = Value(sessionId),
        role = Value(role),
        kind = Value(kind),
        content = Value(content),
        createdAt = Value(createdAt);
  static Insertable<Message> custom({
    Expression<String>? id,
    Expression<String>? sessionId,
    Expression<String>? role,
    Expression<String>? kind,
    Expression<String>? content,
    Expression<String>? metadataJson,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (sessionId != null) 'session_id': sessionId,
      if (role != null) 'role': role,
      if (kind != null) 'kind': kind,
      if (content != null) 'content': content,
      if (metadataJson != null) 'metadata_json': metadataJson,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  MessagesCompanion copyWith(
      {Value<String>? id,
      Value<String>? sessionId,
      Value<String>? role,
      Value<String>? kind,
      Value<String>? content,
      Value<String?>? metadataJson,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return MessagesCompanion(
      id: id ?? this.id,
      sessionId: sessionId ?? this.sessionId,
      role: role ?? this.role,
      kind: kind ?? this.kind,
      content: content ?? this.content,
      metadataJson: metadataJson ?? this.metadataJson,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (sessionId.present) {
      map['session_id'] = Variable<String>(sessionId.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (kind.present) {
      map['kind'] = Variable<String>(kind.value);
    }
    if (content.present) {
      map['content'] = Variable<String>(content.value);
    }
    if (metadataJson.present) {
      map['metadata_json'] = Variable<String>(metadataJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('MessagesCompanion(')
          ..write('id: $id, ')
          ..write('sessionId: $sessionId, ')
          ..write('role: $role, ')
          ..write('kind: $kind, ')
          ..write('content: $content, ')
          ..write('metadataJson: $metadataJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $HandoffEventsTable extends HandoffEvents
    with TableInfo<$HandoffEventsTable, HandoffEvent> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $HandoffEventsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sessionIdMeta =
      const VerificationMeta('sessionId');
  @override
  late final GeneratedColumn<String> sessionId = GeneratedColumn<String>(
      'session_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES sessions (id)'));
  static const VerificationMeta _fromAgentMeta =
      const VerificationMeta('fromAgent');
  @override
  late final GeneratedColumn<String> fromAgent = GeneratedColumn<String>(
      'from_agent', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _toAgentMeta =
      const VerificationMeta('toAgent');
  @override
  late final GeneratedColumn<String> toAgent = GeneratedColumn<String>(
      'to_agent', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _promptMeta = const VerificationMeta('prompt');
  @override
  late final GeneratedColumn<String> prompt = GeneratedColumn<String>(
      'prompt', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns =>
      [id, sessionId, fromAgent, toAgent, prompt, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'handoff_events';
  @override
  VerificationContext validateIntegrity(Insertable<HandoffEvent> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('session_id')) {
      context.handle(_sessionIdMeta,
          sessionId.isAcceptableOrUnknown(data['session_id']!, _sessionIdMeta));
    } else if (isInserting) {
      context.missing(_sessionIdMeta);
    }
    if (data.containsKey('from_agent')) {
      context.handle(_fromAgentMeta,
          fromAgent.isAcceptableOrUnknown(data['from_agent']!, _fromAgentMeta));
    } else if (isInserting) {
      context.missing(_fromAgentMeta);
    }
    if (data.containsKey('to_agent')) {
      context.handle(_toAgentMeta,
          toAgent.isAcceptableOrUnknown(data['to_agent']!, _toAgentMeta));
    } else if (isInserting) {
      context.missing(_toAgentMeta);
    }
    if (data.containsKey('prompt')) {
      context.handle(_promptMeta,
          prompt.isAcceptableOrUnknown(data['prompt']!, _promptMeta));
    } else if (isInserting) {
      context.missing(_promptMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  HandoffEvent map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return HandoffEvent(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      sessionId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}session_id'])!,
      fromAgent: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}from_agent'])!,
      toAgent: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}to_agent'])!,
      prompt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}prompt'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $HandoffEventsTable createAlias(String alias) {
    return $HandoffEventsTable(attachedDatabase, alias);
  }
}

class HandoffEvent extends DataClass implements Insertable<HandoffEvent> {
  final String id;
  final String sessionId;
  final String fromAgent;
  final String toAgent;
  final String prompt;
  final DateTime createdAt;
  const HandoffEvent(
      {required this.id,
      required this.sessionId,
      required this.fromAgent,
      required this.toAgent,
      required this.prompt,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['session_id'] = Variable<String>(sessionId);
    map['from_agent'] = Variable<String>(fromAgent);
    map['to_agent'] = Variable<String>(toAgent);
    map['prompt'] = Variable<String>(prompt);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  HandoffEventsCompanion toCompanion(bool nullToAbsent) {
    return HandoffEventsCompanion(
      id: Value(id),
      sessionId: Value(sessionId),
      fromAgent: Value(fromAgent),
      toAgent: Value(toAgent),
      prompt: Value(prompt),
      createdAt: Value(createdAt),
    );
  }

  factory HandoffEvent.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return HandoffEvent(
      id: serializer.fromJson<String>(json['id']),
      sessionId: serializer.fromJson<String>(json['sessionId']),
      fromAgent: serializer.fromJson<String>(json['fromAgent']),
      toAgent: serializer.fromJson<String>(json['toAgent']),
      prompt: serializer.fromJson<String>(json['prompt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'sessionId': serializer.toJson<String>(sessionId),
      'fromAgent': serializer.toJson<String>(fromAgent),
      'toAgent': serializer.toJson<String>(toAgent),
      'prompt': serializer.toJson<String>(prompt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  HandoffEvent copyWith(
          {String? id,
          String? sessionId,
          String? fromAgent,
          String? toAgent,
          String? prompt,
          DateTime? createdAt}) =>
      HandoffEvent(
        id: id ?? this.id,
        sessionId: sessionId ?? this.sessionId,
        fromAgent: fromAgent ?? this.fromAgent,
        toAgent: toAgent ?? this.toAgent,
        prompt: prompt ?? this.prompt,
        createdAt: createdAt ?? this.createdAt,
      );
  HandoffEvent copyWithCompanion(HandoffEventsCompanion data) {
    return HandoffEvent(
      id: data.id.present ? data.id.value : this.id,
      sessionId: data.sessionId.present ? data.sessionId.value : this.sessionId,
      fromAgent: data.fromAgent.present ? data.fromAgent.value : this.fromAgent,
      toAgent: data.toAgent.present ? data.toAgent.value : this.toAgent,
      prompt: data.prompt.present ? data.prompt.value : this.prompt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('HandoffEvent(')
          ..write('id: $id, ')
          ..write('sessionId: $sessionId, ')
          ..write('fromAgent: $fromAgent, ')
          ..write('toAgent: $toAgent, ')
          ..write('prompt: $prompt, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, sessionId, fromAgent, toAgent, prompt, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is HandoffEvent &&
          other.id == this.id &&
          other.sessionId == this.sessionId &&
          other.fromAgent == this.fromAgent &&
          other.toAgent == this.toAgent &&
          other.prompt == this.prompt &&
          other.createdAt == this.createdAt);
}

class HandoffEventsCompanion extends UpdateCompanion<HandoffEvent> {
  final Value<String> id;
  final Value<String> sessionId;
  final Value<String> fromAgent;
  final Value<String> toAgent;
  final Value<String> prompt;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const HandoffEventsCompanion({
    this.id = const Value.absent(),
    this.sessionId = const Value.absent(),
    this.fromAgent = const Value.absent(),
    this.toAgent = const Value.absent(),
    this.prompt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  HandoffEventsCompanion.insert({
    required String id,
    required String sessionId,
    required String fromAgent,
    required String toAgent,
    required String prompt,
    required DateTime createdAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        sessionId = Value(sessionId),
        fromAgent = Value(fromAgent),
        toAgent = Value(toAgent),
        prompt = Value(prompt),
        createdAt = Value(createdAt);
  static Insertable<HandoffEvent> custom({
    Expression<String>? id,
    Expression<String>? sessionId,
    Expression<String>? fromAgent,
    Expression<String>? toAgent,
    Expression<String>? prompt,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (sessionId != null) 'session_id': sessionId,
      if (fromAgent != null) 'from_agent': fromAgent,
      if (toAgent != null) 'to_agent': toAgent,
      if (prompt != null) 'prompt': prompt,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  HandoffEventsCompanion copyWith(
      {Value<String>? id,
      Value<String>? sessionId,
      Value<String>? fromAgent,
      Value<String>? toAgent,
      Value<String>? prompt,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return HandoffEventsCompanion(
      id: id ?? this.id,
      sessionId: sessionId ?? this.sessionId,
      fromAgent: fromAgent ?? this.fromAgent,
      toAgent: toAgent ?? this.toAgent,
      prompt: prompt ?? this.prompt,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (sessionId.present) {
      map['session_id'] = Variable<String>(sessionId.value);
    }
    if (fromAgent.present) {
      map['from_agent'] = Variable<String>(fromAgent.value);
    }
    if (toAgent.present) {
      map['to_agent'] = Variable<String>(toAgent.value);
    }
    if (prompt.present) {
      map['prompt'] = Variable<String>(prompt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('HandoffEventsCompanion(')
          ..write('id: $id, ')
          ..write('sessionId: $sessionId, ')
          ..write('fromAgent: $fromAgent, ')
          ..write('toAgent: $toAgent, ')
          ..write('prompt: $prompt, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $RemoteHostsTable remoteHosts = $RemoteHostsTable(this);
  late final $ProjectsTable projects = $ProjectsTable(this);
  late final $AgentInstallationsTable agentInstallations =
      $AgentInstallationsTable(this);
  late final $SessionsTable sessions = $SessionsTable(this);
  late final $MessagesTable messages = $MessagesTable(this);
  late final $HandoffEventsTable handoffEvents = $HandoffEventsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        remoteHosts,
        projects,
        agentInstallations,
        sessions,
        messages,
        handoffEvents
      ];
}

typedef $$RemoteHostsTableCreateCompanionBuilder = RemoteHostsCompanion
    Function({
  required String id,
  required String alias,
  required String host,
  Value<int> port,
  required String username,
  required String authKind,
  required String credentialRef,
  Value<String?> knownHostFingerprint,
  required DateTime createdAt,
  Value<DateTime?> lastUsedAt,
  Value<int> rowid,
});
typedef $$RemoteHostsTableUpdateCompanionBuilder = RemoteHostsCompanion
    Function({
  Value<String> id,
  Value<String> alias,
  Value<String> host,
  Value<int> port,
  Value<String> username,
  Value<String> authKind,
  Value<String> credentialRef,
  Value<String?> knownHostFingerprint,
  Value<DateTime> createdAt,
  Value<DateTime?> lastUsedAt,
  Value<int> rowid,
});

class $$RemoteHostsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $RemoteHostsTable,
    RemoteHost,
    $$RemoteHostsTableFilterComposer,
    $$RemoteHostsTableOrderingComposer,
    $$RemoteHostsTableCreateCompanionBuilder,
    $$RemoteHostsTableUpdateCompanionBuilder> {
  $$RemoteHostsTableTableManager(_$AppDatabase db, $RemoteHostsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$RemoteHostsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$RemoteHostsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> alias = const Value.absent(),
            Value<String> host = const Value.absent(),
            Value<int> port = const Value.absent(),
            Value<String> username = const Value.absent(),
            Value<String> authKind = const Value.absent(),
            Value<String> credentialRef = const Value.absent(),
            Value<String?> knownHostFingerprint = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime?> lastUsedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              RemoteHostsCompanion(
            id: id,
            alias: alias,
            host: host,
            port: port,
            username: username,
            authKind: authKind,
            credentialRef: credentialRef,
            knownHostFingerprint: knownHostFingerprint,
            createdAt: createdAt,
            lastUsedAt: lastUsedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String alias,
            required String host,
            Value<int> port = const Value.absent(),
            required String username,
            required String authKind,
            required String credentialRef,
            Value<String?> knownHostFingerprint = const Value.absent(),
            required DateTime createdAt,
            Value<DateTime?> lastUsedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              RemoteHostsCompanion.insert(
            id: id,
            alias: alias,
            host: host,
            port: port,
            username: username,
            authKind: authKind,
            credentialRef: credentialRef,
            knownHostFingerprint: knownHostFingerprint,
            createdAt: createdAt,
            lastUsedAt: lastUsedAt,
            rowid: rowid,
          ),
        ));
}

class $$RemoteHostsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $RemoteHostsTable> {
  $$RemoteHostsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get alias => $state.composableBuilder(
      column: $state.table.alias,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get host => $state.composableBuilder(
      column: $state.table.host,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get port => $state.composableBuilder(
      column: $state.table.port,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get username => $state.composableBuilder(
      column: $state.table.username,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get authKind => $state.composableBuilder(
      column: $state.table.authKind,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get credentialRef => $state.composableBuilder(
      column: $state.table.credentialRef,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get knownHostFingerprint => $state.composableBuilder(
      column: $state.table.knownHostFingerprint,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get lastUsedAt => $state.composableBuilder(
      column: $state.table.lastUsedAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ComposableFilter projectsRefs(
      ComposableFilter Function($$ProjectsTableFilterComposer f) f) {
    final $$ProjectsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $state.db.projects,
        getReferencedColumn: (t) => t.hostId,
        builder: (joinBuilder, parentComposers) =>
            $$ProjectsTableFilterComposer(ComposerState(
                $state.db, $state.db.projects, joinBuilder, parentComposers)));
    return f(composer);
  }

  ComposableFilter agentInstallationsRefs(
      ComposableFilter Function($$AgentInstallationsTableFilterComposer f) f) {
    final $$AgentInstallationsTableFilterComposer composer = $state
        .composerBuilder(
            composer: this,
            getCurrentColumn: (t) => t.id,
            referencedTable: $state.db.agentInstallations,
            getReferencedColumn: (t) => t.hostId,
            builder: (joinBuilder, parentComposers) =>
                $$AgentInstallationsTableFilterComposer(ComposerState(
                    $state.db,
                    $state.db.agentInstallations,
                    joinBuilder,
                    parentComposers)));
    return f(composer);
  }

  ComposableFilter sessionsRefs(
      ComposableFilter Function($$SessionsTableFilterComposer f) f) {
    final $$SessionsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $state.db.sessions,
        getReferencedColumn: (t) => t.hostId,
        builder: (joinBuilder, parentComposers) =>
            $$SessionsTableFilterComposer(ComposerState(
                $state.db, $state.db.sessions, joinBuilder, parentComposers)));
    return f(composer);
  }
}

class $$RemoteHostsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $RemoteHostsTable> {
  $$RemoteHostsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get alias => $state.composableBuilder(
      column: $state.table.alias,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get host => $state.composableBuilder(
      column: $state.table.host,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get port => $state.composableBuilder(
      column: $state.table.port,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get username => $state.composableBuilder(
      column: $state.table.username,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get authKind => $state.composableBuilder(
      column: $state.table.authKind,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get credentialRef => $state.composableBuilder(
      column: $state.table.credentialRef,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get knownHostFingerprint => $state.composableBuilder(
      column: $state.table.knownHostFingerprint,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get lastUsedAt => $state.composableBuilder(
      column: $state.table.lastUsedAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$ProjectsTableCreateCompanionBuilder = ProjectsCompanion Function({
  required String id,
  required String hostId,
  required String path,
  Value<String?> label,
  Value<String?> color,
  Value<bool> favorite,
  required DateTime createdAt,
  Value<int> rowid,
});
typedef $$ProjectsTableUpdateCompanionBuilder = ProjectsCompanion Function({
  Value<String> id,
  Value<String> hostId,
  Value<String> path,
  Value<String?> label,
  Value<String?> color,
  Value<bool> favorite,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$ProjectsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ProjectsTable,
    Project,
    $$ProjectsTableFilterComposer,
    $$ProjectsTableOrderingComposer,
    $$ProjectsTableCreateCompanionBuilder,
    $$ProjectsTableUpdateCompanionBuilder> {
  $$ProjectsTableTableManager(_$AppDatabase db, $ProjectsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$ProjectsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$ProjectsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> hostId = const Value.absent(),
            Value<String> path = const Value.absent(),
            Value<String?> label = const Value.absent(),
            Value<String?> color = const Value.absent(),
            Value<bool> favorite = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsCompanion(
            id: id,
            hostId: hostId,
            path: path,
            label: label,
            color: color,
            favorite: favorite,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String hostId,
            required String path,
            Value<String?> label = const Value.absent(),
            Value<String?> color = const Value.absent(),
            Value<bool> favorite = const Value.absent(),
            required DateTime createdAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsCompanion.insert(
            id: id,
            hostId: hostId,
            path: path,
            label: label,
            color: color,
            favorite: favorite,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$ProjectsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get path => $state.composableBuilder(
      column: $state.table.path,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get label => $state.composableBuilder(
      column: $state.table.label,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get color => $state.composableBuilder(
      column: $state.table.color,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get favorite => $state.composableBuilder(
      column: $state.table.favorite,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  $$RemoteHostsTableFilterComposer get hostId {
    final $$RemoteHostsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.hostId,
        referencedTable: $state.db.remoteHosts,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$RemoteHostsTableFilterComposer(ComposerState($state.db,
                $state.db.remoteHosts, joinBuilder, parentComposers)));
    return composer;
  }

  ComposableFilter sessionsRefs(
      ComposableFilter Function($$SessionsTableFilterComposer f) f) {
    final $$SessionsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $state.db.sessions,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder, parentComposers) =>
            $$SessionsTableFilterComposer(ComposerState(
                $state.db, $state.db.sessions, joinBuilder, parentComposers)));
    return f(composer);
  }
}

class $$ProjectsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get path => $state.composableBuilder(
      column: $state.table.path,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get label => $state.composableBuilder(
      column: $state.table.label,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get color => $state.composableBuilder(
      column: $state.table.color,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get favorite => $state.composableBuilder(
      column: $state.table.favorite,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  $$RemoteHostsTableOrderingComposer get hostId {
    final $$RemoteHostsTableOrderingComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.hostId,
        referencedTable: $state.db.remoteHosts,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$RemoteHostsTableOrderingComposer(ComposerState($state.db,
                $state.db.remoteHosts, joinBuilder, parentComposers)));
    return composer;
  }
}

typedef $$AgentInstallationsTableCreateCompanionBuilder
    = AgentInstallationsCompanion Function({
  required String id,
  required String hostId,
  required String agentKind,
  required String status,
  Value<String?> version,
  Value<DateTime?> installedAt,
  Value<DateTime?> lastCheckAt,
  Value<int> rowid,
});
typedef $$AgentInstallationsTableUpdateCompanionBuilder
    = AgentInstallationsCompanion Function({
  Value<String> id,
  Value<String> hostId,
  Value<String> agentKind,
  Value<String> status,
  Value<String?> version,
  Value<DateTime?> installedAt,
  Value<DateTime?> lastCheckAt,
  Value<int> rowid,
});

class $$AgentInstallationsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AgentInstallationsTable,
    AgentInstallation,
    $$AgentInstallationsTableFilterComposer,
    $$AgentInstallationsTableOrderingComposer,
    $$AgentInstallationsTableCreateCompanionBuilder,
    $$AgentInstallationsTableUpdateCompanionBuilder> {
  $$AgentInstallationsTableTableManager(
      _$AppDatabase db, $AgentInstallationsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$AgentInstallationsTableFilterComposer(ComposerState(db, table)),
          orderingComposer: $$AgentInstallationsTableOrderingComposer(
              ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> hostId = const Value.absent(),
            Value<String> agentKind = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> version = const Value.absent(),
            Value<DateTime?> installedAt = const Value.absent(),
            Value<DateTime?> lastCheckAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AgentInstallationsCompanion(
            id: id,
            hostId: hostId,
            agentKind: agentKind,
            status: status,
            version: version,
            installedAt: installedAt,
            lastCheckAt: lastCheckAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String hostId,
            required String agentKind,
            required String status,
            Value<String?> version = const Value.absent(),
            Value<DateTime?> installedAt = const Value.absent(),
            Value<DateTime?> lastCheckAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AgentInstallationsCompanion.insert(
            id: id,
            hostId: hostId,
            agentKind: agentKind,
            status: status,
            version: version,
            installedAt: installedAt,
            lastCheckAt: lastCheckAt,
            rowid: rowid,
          ),
        ));
}

class $$AgentInstallationsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $AgentInstallationsTable> {
  $$AgentInstallationsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get agentKind => $state.composableBuilder(
      column: $state.table.agentKind,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get status => $state.composableBuilder(
      column: $state.table.status,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get version => $state.composableBuilder(
      column: $state.table.version,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get installedAt => $state.composableBuilder(
      column: $state.table.installedAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get lastCheckAt => $state.composableBuilder(
      column: $state.table.lastCheckAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  $$RemoteHostsTableFilterComposer get hostId {
    final $$RemoteHostsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.hostId,
        referencedTable: $state.db.remoteHosts,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$RemoteHostsTableFilterComposer(ComposerState($state.db,
                $state.db.remoteHosts, joinBuilder, parentComposers)));
    return composer;
  }
}

class $$AgentInstallationsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $AgentInstallationsTable> {
  $$AgentInstallationsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get agentKind => $state.composableBuilder(
      column: $state.table.agentKind,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get status => $state.composableBuilder(
      column: $state.table.status,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get version => $state.composableBuilder(
      column: $state.table.version,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get installedAt => $state.composableBuilder(
      column: $state.table.installedAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get lastCheckAt => $state.composableBuilder(
      column: $state.table.lastCheckAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  $$RemoteHostsTableOrderingComposer get hostId {
    final $$RemoteHostsTableOrderingComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.hostId,
        referencedTable: $state.db.remoteHosts,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$RemoteHostsTableOrderingComposer(ComposerState($state.db,
                $state.db.remoteHosts, joinBuilder, parentComposers)));
    return composer;
  }
}

typedef $$SessionsTableCreateCompanionBuilder = SessionsCompanion Function({
  required String id,
  required String hostId,
  Value<String?> projectId,
  required String agentKind,
  Value<String?> title,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<bool> archived,
  Value<int> rowid,
});
typedef $$SessionsTableUpdateCompanionBuilder = SessionsCompanion Function({
  Value<String> id,
  Value<String> hostId,
  Value<String?> projectId,
  Value<String> agentKind,
  Value<String?> title,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<bool> archived,
  Value<int> rowid,
});

class $$SessionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SessionsTable,
    Session,
    $$SessionsTableFilterComposer,
    $$SessionsTableOrderingComposer,
    $$SessionsTableCreateCompanionBuilder,
    $$SessionsTableUpdateCompanionBuilder> {
  $$SessionsTableTableManager(_$AppDatabase db, $SessionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$SessionsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$SessionsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> hostId = const Value.absent(),
            Value<String?> projectId = const Value.absent(),
            Value<String> agentKind = const Value.absent(),
            Value<String?> title = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<bool> archived = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SessionsCompanion(
            id: id,
            hostId: hostId,
            projectId: projectId,
            agentKind: agentKind,
            title: title,
            createdAt: createdAt,
            updatedAt: updatedAt,
            archived: archived,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String hostId,
            Value<String?> projectId = const Value.absent(),
            required String agentKind,
            Value<String?> title = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<bool> archived = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SessionsCompanion.insert(
            id: id,
            hostId: hostId,
            projectId: projectId,
            agentKind: agentKind,
            title: title,
            createdAt: createdAt,
            updatedAt: updatedAt,
            archived: archived,
            rowid: rowid,
          ),
        ));
}

class $$SessionsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $SessionsTable> {
  $$SessionsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get agentKind => $state.composableBuilder(
      column: $state.table.agentKind,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get title => $state.composableBuilder(
      column: $state.table.title,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get updatedAt => $state.composableBuilder(
      column: $state.table.updatedAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get archived => $state.composableBuilder(
      column: $state.table.archived,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  $$RemoteHostsTableFilterComposer get hostId {
    final $$RemoteHostsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.hostId,
        referencedTable: $state.db.remoteHosts,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$RemoteHostsTableFilterComposer(ComposerState($state.db,
                $state.db.remoteHosts, joinBuilder, parentComposers)));
    return composer;
  }

  $$ProjectsTableFilterComposer get projectId {
    final $$ProjectsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $state.db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$ProjectsTableFilterComposer(ComposerState(
                $state.db, $state.db.projects, joinBuilder, parentComposers)));
    return composer;
  }

  ComposableFilter messagesRefs(
      ComposableFilter Function($$MessagesTableFilterComposer f) f) {
    final $$MessagesTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $state.db.messages,
        getReferencedColumn: (t) => t.sessionId,
        builder: (joinBuilder, parentComposers) =>
            $$MessagesTableFilterComposer(ComposerState(
                $state.db, $state.db.messages, joinBuilder, parentComposers)));
    return f(composer);
  }

  ComposableFilter handoffEventsRefs(
      ComposableFilter Function($$HandoffEventsTableFilterComposer f) f) {
    final $$HandoffEventsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $state.db.handoffEvents,
        getReferencedColumn: (t) => t.sessionId,
        builder: (joinBuilder, parentComposers) =>
            $$HandoffEventsTableFilterComposer(ComposerState($state.db,
                $state.db.handoffEvents, joinBuilder, parentComposers)));
    return f(composer);
  }
}

class $$SessionsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $SessionsTable> {
  $$SessionsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get agentKind => $state.composableBuilder(
      column: $state.table.agentKind,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get title => $state.composableBuilder(
      column: $state.table.title,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get updatedAt => $state.composableBuilder(
      column: $state.table.updatedAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get archived => $state.composableBuilder(
      column: $state.table.archived,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  $$RemoteHostsTableOrderingComposer get hostId {
    final $$RemoteHostsTableOrderingComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.hostId,
        referencedTable: $state.db.remoteHosts,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$RemoteHostsTableOrderingComposer(ComposerState($state.db,
                $state.db.remoteHosts, joinBuilder, parentComposers)));
    return composer;
  }

  $$ProjectsTableOrderingComposer get projectId {
    final $$ProjectsTableOrderingComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $state.db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$ProjectsTableOrderingComposer(ComposerState(
                $state.db, $state.db.projects, joinBuilder, parentComposers)));
    return composer;
  }
}

typedef $$MessagesTableCreateCompanionBuilder = MessagesCompanion Function({
  required String id,
  required String sessionId,
  required String role,
  required String kind,
  required String content,
  Value<String?> metadataJson,
  required DateTime createdAt,
  Value<int> rowid,
});
typedef $$MessagesTableUpdateCompanionBuilder = MessagesCompanion Function({
  Value<String> id,
  Value<String> sessionId,
  Value<String> role,
  Value<String> kind,
  Value<String> content,
  Value<String?> metadataJson,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$MessagesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $MessagesTable,
    Message,
    $$MessagesTableFilterComposer,
    $$MessagesTableOrderingComposer,
    $$MessagesTableCreateCompanionBuilder,
    $$MessagesTableUpdateCompanionBuilder> {
  $$MessagesTableTableManager(_$AppDatabase db, $MessagesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$MessagesTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$MessagesTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> sessionId = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<String> kind = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String?> metadataJson = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              MessagesCompanion(
            id: id,
            sessionId: sessionId,
            role: role,
            kind: kind,
            content: content,
            metadataJson: metadataJson,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String sessionId,
            required String role,
            required String kind,
            required String content,
            Value<String?> metadataJson = const Value.absent(),
            required DateTime createdAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              MessagesCompanion.insert(
            id: id,
            sessionId: sessionId,
            role: role,
            kind: kind,
            content: content,
            metadataJson: metadataJson,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$MessagesTableFilterComposer
    extends FilterComposer<_$AppDatabase, $MessagesTable> {
  $$MessagesTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get role => $state.composableBuilder(
      column: $state.table.role,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get kind => $state.composableBuilder(
      column: $state.table.kind,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get content => $state.composableBuilder(
      column: $state.table.content,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get metadataJson => $state.composableBuilder(
      column: $state.table.metadataJson,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  $$SessionsTableFilterComposer get sessionId {
    final $$SessionsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.sessionId,
        referencedTable: $state.db.sessions,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$SessionsTableFilterComposer(ComposerState(
                $state.db, $state.db.sessions, joinBuilder, parentComposers)));
    return composer;
  }
}

class $$MessagesTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $MessagesTable> {
  $$MessagesTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get role => $state.composableBuilder(
      column: $state.table.role,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get kind => $state.composableBuilder(
      column: $state.table.kind,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get content => $state.composableBuilder(
      column: $state.table.content,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get metadataJson => $state.composableBuilder(
      column: $state.table.metadataJson,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  $$SessionsTableOrderingComposer get sessionId {
    final $$SessionsTableOrderingComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.sessionId,
        referencedTable: $state.db.sessions,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$SessionsTableOrderingComposer(ComposerState(
                $state.db, $state.db.sessions, joinBuilder, parentComposers)));
    return composer;
  }
}

typedef $$HandoffEventsTableCreateCompanionBuilder = HandoffEventsCompanion
    Function({
  required String id,
  required String sessionId,
  required String fromAgent,
  required String toAgent,
  required String prompt,
  required DateTime createdAt,
  Value<int> rowid,
});
typedef $$HandoffEventsTableUpdateCompanionBuilder = HandoffEventsCompanion
    Function({
  Value<String> id,
  Value<String> sessionId,
  Value<String> fromAgent,
  Value<String> toAgent,
  Value<String> prompt,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$HandoffEventsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $HandoffEventsTable,
    HandoffEvent,
    $$HandoffEventsTableFilterComposer,
    $$HandoffEventsTableOrderingComposer,
    $$HandoffEventsTableCreateCompanionBuilder,
    $$HandoffEventsTableUpdateCompanionBuilder> {
  $$HandoffEventsTableTableManager(_$AppDatabase db, $HandoffEventsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$HandoffEventsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$HandoffEventsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> sessionId = const Value.absent(),
            Value<String> fromAgent = const Value.absent(),
            Value<String> toAgent = const Value.absent(),
            Value<String> prompt = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              HandoffEventsCompanion(
            id: id,
            sessionId: sessionId,
            fromAgent: fromAgent,
            toAgent: toAgent,
            prompt: prompt,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String sessionId,
            required String fromAgent,
            required String toAgent,
            required String prompt,
            required DateTime createdAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              HandoffEventsCompanion.insert(
            id: id,
            sessionId: sessionId,
            fromAgent: fromAgent,
            toAgent: toAgent,
            prompt: prompt,
            createdAt: createdAt,
            rowid: rowid,
          ),
        ));
}

class $$HandoffEventsTableFilterComposer
    extends FilterComposer<_$AppDatabase, $HandoffEventsTable> {
  $$HandoffEventsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get fromAgent => $state.composableBuilder(
      column: $state.table.fromAgent,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get toAgent => $state.composableBuilder(
      column: $state.table.toAgent,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get prompt => $state.composableBuilder(
      column: $state.table.prompt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  $$SessionsTableFilterComposer get sessionId {
    final $$SessionsTableFilterComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.sessionId,
        referencedTable: $state.db.sessions,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$SessionsTableFilterComposer(ComposerState(
                $state.db, $state.db.sessions, joinBuilder, parentComposers)));
    return composer;
  }
}

class $$HandoffEventsTableOrderingComposer
    extends OrderingComposer<_$AppDatabase, $HandoffEventsTable> {
  $$HandoffEventsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get fromAgent => $state.composableBuilder(
      column: $state.table.fromAgent,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get toAgent => $state.composableBuilder(
      column: $state.table.toAgent,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get prompt => $state.composableBuilder(
      column: $state.table.prompt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  $$SessionsTableOrderingComposer get sessionId {
    final $$SessionsTableOrderingComposer composer = $state.composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.sessionId,
        referencedTable: $state.db.sessions,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder, parentComposers) =>
            $$SessionsTableOrderingComposer(ComposerState(
                $state.db, $state.db.sessions, joinBuilder, parentComposers)));
    return composer;
  }
}

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$RemoteHostsTableTableManager get remoteHosts =>
      $$RemoteHostsTableTableManager(_db, _db.remoteHosts);
  $$ProjectsTableTableManager get projects =>
      $$ProjectsTableTableManager(_db, _db.projects);
  $$AgentInstallationsTableTableManager get agentInstallations =>
      $$AgentInstallationsTableTableManager(_db, _db.agentInstallations);
  $$SessionsTableTableManager get sessions =>
      $$SessionsTableTableManager(_db, _db.sessions);
  $$MessagesTableTableManager get messages =>
      $$MessagesTableTableManager(_db, _db.messages);
  $$HandoffEventsTableTableManager get handoffEvents =>
      $$HandoffEventsTableTableManager(_db, _db.handoffEvents);
}

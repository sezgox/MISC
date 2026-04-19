import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../services/persistence/app_database.dart';
import '../../../services/terminal/terminal_controller.dart';
import '../../agents/data/adapters/base_cli_agent_adapter.dart';
import '../../agents/domain/agent_adapter.dart';
import '../../agents/domain/agent_event.dart';
import '../../agents/domain/agent_kind.dart';
import '../../agents/domain/agent_run_handle.dart';
import '../../agents/domain/handoff_context.dart';
import '../../projects/data/projects_repository.dart';
import '../data/sessions_repository.dart';

/// Public-facing message model the UI renders. Combines persisted [Message]s
/// with live-streamed partials.
class ChatMessage {
  ChatMessage({
    required this.id,
    required this.role,
    required this.kind,
    required this.content,
    required this.createdAt,
    this.language,
    this.path,
    this.url,
    this.level,
    this.partial = false,
  });

  final String id;
  final String role; // 'user' | 'agent' | 'system'
  final String kind; // 'text' | 'code' | 'diff' | 'log' | 'url' | 'terminal' | 'handoff'
  String content;
  final DateTime createdAt;
  final String? language;
  final String? path;
  final String? url;
  final String? level;
  bool partial;
}

class SessionViewState {
  const SessionViewState({
    required this.sessionId,
    required this.hostId,
    required this.agent,
    required this.messages,
    required this.isRunning,
    this.projectPath,
    this.error,
  });

  final String sessionId;
  final String hostId;
  final AgentKind agent;
  final List<ChatMessage> messages;
  final bool isRunning;
  final String? projectPath;
  final String? error;

  SessionViewState copyWith({
    List<ChatMessage>? messages,
    bool? isRunning,
    AgentKind? agent,
    String? projectPath,
    Object? error = _sentinel,
  }) =>
      SessionViewState(
        sessionId: sessionId,
        hostId: hostId,
        agent: agent ?? this.agent,
        messages: messages ?? this.messages,
        isRunning: isRunning ?? this.isRunning,
        projectPath: projectPath ?? this.projectPath,
        error: identical(error, _sentinel) ? this.error : error as String?,
      );
}

const _sentinel = Object();

/// Per-sessionId controller. Watching it kicks off connect → detect → REPL.
///
/// We use `AsyncNotifierProvider.family<SessionController, SessionViewState, String>`.
class SessionController
    extends FamilyAsyncNotifier<SessionViewState, String> {
  late final SessionsRepository _sessions;
  late final ProjectsRepository _projects;

  AgentAdapter? _adapter;
  AgentRunHandle? _handle;
  TerminalController? _terminal;
  StreamSubscription<AgentEvent>? _eventsSub;

  @override
  Future<SessionViewState> build(String sessionId) async {
    _sessions = ref.read(sessionsRepositoryProvider);
    _projects = ref.read(projectsRepositoryProvider);

    final row = await _sessions.getById(sessionId);
    if (row == null) {
      throw StateError('session $sessionId not found');
    }
    final kind = AgentKind.tryParse(row.agentKind) ?? AgentKind.codex;

    String? projectPath;
    if (row.projectId != null) {
      final p = await _projects.getById(row.projectId!);
      projectPath = p?.path;
    }

    final persisted = await _sessions.loadMessages(sessionId);
    final messages = persisted.map(_toChat).toList();

    ref.onDispose(_cleanup);

    // Fire-and-forget: start the REPL. We don't await to avoid blocking the
    // UI; the "connecting" / error states are surfaced via the state stream.
    unawaited(_bootREPL(row, kind, projectPath));

    return SessionViewState(
      sessionId: sessionId,
      hostId: row.hostId,
      agent: kind,
      messages: messages,
      isRunning: false,
      projectPath: projectPath,
    );
  }

  Future<void> _bootREPL(Session row, AgentKind kind, String? projectPath) async {
    try {
      final registry = ref.read(agentRegistryProvider);
      final adapter = registry.byKind(kind);
      if (adapter == null) {
        state = AsyncData(_state.copyWith(error: 'agente no soportado: ${kind.id}'));
        return;
      }
      final hosts = ref.read(hostsRepositoryProvider);
      final mgr = ref.read(sshConnectionManagerProvider);

      final host = await hosts.getById(row.hostId);
      if (host == null) {
        state = AsyncData(_state.copyWith(error: 'host no encontrado'));
        return;
      }

      _appendSystem('Conectando a ${host.label}...');
      final session = await mgr.connect(hosts.configFor(host));
      await hosts.markUsed(host.id);
      _appendSystem('Conectado. Iniciando ${adapter.displayName}...');

      _adapter = adapter;
      _handle = await adapter.startRepl(session, projectPath: projectPath);

      // Terminal tab wiring: we expose the shell bytes directly via the
      // TerminalController. The shell is owned by the handle, not the
      // controller, so we mark terminal as non-owning (close handle only).
      final handle = _handle!;
      if (handle is CliAgentRunHandle) {
        _terminal = TerminalController(shell: handle.shell);
      }

      _eventsSub = adapter.events(handle).listen(_onAgentEvent);
      state = AsyncData(_state.copyWith(isRunning: true));
    } on Object catch (e) {
      state = AsyncData(_state.copyWith(error: e.toString(), isRunning: false));
    }
  }

  TerminalController? get terminal => _terminal;

  // -------------------- public API --------------------

  Future<void> sendPrompt(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _adapter == null || _handle == null) return;
    final msg = await _sessions.appendMessage(
      sessionId: _state.sessionId,
      role: 'user',
      kind: 'text',
      content: trimmed,
    );
    _pushMessage(_toChat(msg));
    await _adapter!.send(_handle!, trimmed);
    // Start a fresh "partial" agent bubble to accumulate the streaming answer.
    _pendingAgentMessage = ChatMessage(
      id: 'pending_${DateTime.now().microsecondsSinceEpoch}',
      role: 'agent',
      kind: 'text',
      content: '',
      createdAt: DateTime.now(),
      partial: true,
    );
    _pushMessage(_pendingAgentMessage!);
  }

  Future<void> switchAgent(AgentKind to, {String summary = ''}) async {
    if (to == _state.agent) return;
    final from = _state.agent;
    // 1) stop current
    if (_adapter != null && _handle != null) {
      await _adapter!.stop(_handle!);
      await _eventsSub?.cancel();
      _handle = null;
    }
    // 2) update db
    await _sessions.setAgent(_state.sessionId, to);
    // 3) build handoff
    final registry = ref.read(agentRegistryProvider);
    final nextAdapter = registry.byKind(to);
    if (nextAdapter == null) {
      state = AsyncData(_state.copyWith(error: 'agente no soportado: ${to.id}'));
      return;
    }
    final ctx = HandoffContext(
      fromAgent: from,
      toAgent: to,
      projectPath: _state.projectPath,
      summary: summary.isEmpty
          ? 'Sesi\u00f3n en curso; continuar desde el \u00faltimo mensaje.'
          : summary,
      recentMessages: _state.messages
          .where((m) => m.kind == 'text')
          .toList()
          .reversed
          .take(8)
          .toList()
          .reversed
          .map((m) => HandoffMessage(role: m.role, content: m.content))
          .toList(),
    );
    final handoffPrompt = nextAdapter.buildHandoffPrompt(ctx);
    await _sessions.recordHandoff(
      sessionId: _state.sessionId,
      from: from,
      to: to,
      prompt: handoffPrompt,
    );
    _appendSystem('Cambiando a ${nextAdapter.displayName}. Enviando handoff...');
    state = AsyncData(_state.copyWith(agent: to, isRunning: false));
    // 4) boot new REPL + send handoff prompt
    final hosts = ref.read(hostsRepositoryProvider);
    final host = await hosts.getById(_state.hostId);
    if (host == null) return;
    final mgr = ref.read(sshConnectionManagerProvider);
    final session = await mgr.connect(hosts.configFor(host));
    _adapter = nextAdapter;
    _handle = await nextAdapter.startRepl(
      session,
      projectPath: _state.projectPath,
    );
    _eventsSub = nextAdapter.events(_handle!).listen(_onAgentEvent);
    state = AsyncData(_state.copyWith(isRunning: true));
    await nextAdapter.send(_handle!, handoffPrompt);
  }

  Future<void> stop() async {
    if (_adapter != null && _handle != null) {
      await _adapter!.stop(_handle!);
    }
    await _eventsSub?.cancel();
    _handle = null;
    state = AsyncData(_state.copyWith(isRunning: false));
  }

  // -------------------- internals --------------------

  SessionViewState get _state => state.requireValue;

  ChatMessage? _pendingAgentMessage;

  void _pushMessage(ChatMessage m) {
    final next = [..._state.messages, m];
    state = AsyncData(_state.copyWith(messages: next));
  }

  void _appendSystem(String text) {
    _pushMessage(
      ChatMessage(
        id: 'sys_${DateTime.now().microsecondsSinceEpoch}',
        role: 'system',
        kind: 'text',
        content: text,
        createdAt: DateTime.now(),
      ),
    );
  }

  Future<void> _onAgentEvent(AgentEvent event) async {
    switch (event) {
      case TextDelta(:final text):
        _appendToPartialAgent(text);
      case CodeBlockEvent(:final code, :final language):
        await _flushPartialAgent();
        final msg = await _sessions.appendMessage(
          sessionId: _state.sessionId,
          role: 'agent',
          kind: 'code',
          content: code,
          metadata: language == null ? null : {'language': language},
        );
        _pushMessage(_toChat(msg));
      case DiffBlockEvent(:final unifiedDiff, :final path):
        await _flushPartialAgent();
        final msg = await _sessions.appendMessage(
          sessionId: _state.sessionId,
          role: 'agent',
          kind: 'diff',
          content: unifiedDiff,
          metadata: path == null ? null : {'path': path},
        );
        _pushMessage(_toChat(msg));
      case LogLineEvent(:final line, :final level):
        _pushMessage(ChatMessage(
          id: 'log_${DateTime.now().microsecondsSinceEpoch}',
          role: 'system',
          kind: 'log',
          content: line,
          level: level,
          createdAt: DateTime.now(),
        ));
      case LoginUrlDetected(:final url):
        final msg = await _sessions.appendMessage(
          sessionId: _state.sessionId,
          role: 'system',
          kind: 'url',
          content: url,
          metadata: {'url': url},
        );
        _pushMessage(_toChat(msg));
      case NeedsInputEvent(:final prompt):
        _appendSystem('(espera input) $prompt');
      case CompletedEvent():
        await _flushPartialAgent();
      case FailedEvent(:final message):
        await _flushPartialAgent();
        _appendSystem('Error del agente: $message');
    }
  }

  void _appendToPartialAgent(String text) {
    _pendingAgentMessage ??= ChatMessage(
      id: 'pending_${DateTime.now().microsecondsSinceEpoch}',
      role: 'agent',
      kind: 'text',
      content: '',
      createdAt: DateTime.now(),
      partial: true,
    );
    final pm = _pendingAgentMessage!;
    pm.content += text;
    if (!_state.messages.contains(pm)) {
      _pushMessage(pm);
    } else {
      // Trigger rebuild with the mutated list.
      state = AsyncData(_state.copyWith(messages: [..._state.messages]));
    }
  }

  Future<void> _flushPartialAgent() async {
    final pm = _pendingAgentMessage;
    if (pm == null) return;
    _pendingAgentMessage = null;
    final text = pm.content.trim();
    if (text.isEmpty) {
      // Remove it from view.
      final next = _state.messages.where((m) => m.id != pm.id).toList();
      state = AsyncData(_state.copyWith(messages: next));
      return;
    }
    final msg = await _sessions.appendMessage(
      sessionId: _state.sessionId,
      role: 'agent',
      kind: 'text',
      content: text,
    );
    final persisted = _toChat(msg);
    final next = _state.messages.map((m) => m.id == pm.id ? persisted : m).toList();
    state = AsyncData(_state.copyWith(messages: next));
  }

  ChatMessage _toChat(Message m) {
    final meta = SessionsRepository.decodeMetadata(m.metadataJson);
    return ChatMessage(
      id: m.id,
      role: m.role,
      kind: m.kind,
      content: m.content,
      createdAt: m.createdAt,
      language: meta['language'],
      path: meta['path'],
      url: meta['url'],
      level: meta['level'],
    );
  }

  Future<void> _cleanup() async {
    await _eventsSub?.cancel();
    if (_handle != null && _adapter != null) {
      await _adapter!.stop(_handle!);
    }
    await _terminal?.dispose();
    _terminal = null;
    _handle = null;
  }
}

final sessionControllerProvider = AsyncNotifierProvider.family<
    SessionController, SessionViewState, String>(
  SessionController.new,
);

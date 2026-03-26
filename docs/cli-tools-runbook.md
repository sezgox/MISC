# CLI Tools Runbook (Phase 3)

This runbook defines the manual procedure to validate and prepare CLI tooling on the Linux host for SSH-based operations.

Scope in this phase:
- `codex` CLI
- `cursor` CLI (if available for Linux host usage)
- `open code` CLI (tool identity validation + fallback)

Out of scope in this phase:
- GUI removal/headless migration
- persistent shell sessions (`tmux`, `zsh`, aliases)

## 1) Baseline checks

Run from SSH session:

```bash
uname -a
whoami
command -v codex || true
command -v cursor || true
command -v code || true
```

Interpretation:
- `codex` found -> candidate ready.
- `cursor` found -> candidate ready.
- only `code` found -> VS Code CLI exists, not necessarily "open code" requirement.

## 2) Codex CLI

Validation checklist:
```bash
codex --version
codex --help
```

Expected status labels:
- `installed`: both commands succeed.
- `not installed`: command not found.
- `blocked`: binary exists but auth/network/policy blocks usage.

Operational note:
- Keep auth/token material outside repo-tracked files.

## 3) Cursor CLI

Validation checklist:
```bash
cursor --version
cursor --help
```

Expected status labels:
- `installed`
- `not installed`
- `not applicable` (if no Linux-host CLI distribution is available/approved in your environment)

If not applicable:
- document fallback workflow (remote edits through SSH + Git + existing editor tools).

## 4) "Open code" CLI ambiguity resolution

`open code` is currently ambiguous and must be resolved before installation.

Possible interpretations:
- `code` (VS Code CLI launcher)
- another third-party binary named `open`/`opencode`/similar
- a custom internal script alias

Decision policy:
1. Confirm exact binary/package name.
2. Confirm source (official package/release).
3. Confirm minimum commands expected (`--version`, `--help`, open folder/file action).
4. Document final decision in this file before rollout.

Temporary fallback:
- use `code` CLI if available:
```bash
code --version
code .
```

## 5) Readiness checklist (Phase 3)

- A status is recorded for each tool:
  - `codex`: `installed|not installed|blocked`
  - `cursor`: `installed|not installed|not applicable`
  - `open code`: `resolved|pending definition`
- Verification commands are documented and tested manually from SSH.
- No GUI/headless/systemd target changes are made in this phase.

## 6) Relation with later phases

- Phase 4: optional automation of monitoring/Kuma configuration in CI.
- Final phase: headless migration + persistent shell/session strategy.

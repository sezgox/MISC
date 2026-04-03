# Ejecución: agentes en servidor (guía operativa)

Complementa [server-ai-agents-plan.md](server-ai-agents-plan.md). Ejecuta los pasos **en el host** por SSH con el usuario elegido para agentes (recomendado: `sezgox`).

## Fase A — Base (manual)

Si faltan paquetes en Ubuntu/Debian:

```bash
sudo apt-get update && sudo apt-get install -y git curl tmux ca-certificates
```

Directorio para ficheros `*.env` locales (sin commitear):

```bash
mkdir -p ~/.config/misc-agent-secrets
chmod 700 ~/.config/misc-agent-secrets
```

## Fase B — Primera CLI (p. ej. Cursor) y smoke

1. Instalación según doc oficial: [Cursor CLI — Installation](https://cursor.com/docs/cli/installation) (p. ej. `curl https://cursor.com/install -fsS | bash`).
2. Asegurar `agent` en PATH (suele ser `~/.local/bin`; añadir a `~/.bashrc` si hace falta).
3. Autenticación headless: [Using Headless CLI](https://cursor.com/docs/cli/headless) (p. ej. `CURSOR_API_KEY` en sesión; opcional `~/.config/misc-agent-secrets/cursor.env` con `chmod 600` y `source` solo al trabajar).
4. **Smoke:** `agent --version`; luego una orden mínima no destructiva según la doc.

## Fase C — Más CLIs (manual)

- **Codex:** [Codex quickstart](https://developers.openai.com/codex/quickstart/) — suele ser `npm install -g @openai/codex` con Node 20+.
- **OpenCode:** [sst/opencode](https://github.com/sst/opencode) — seguir el instalador oficial (p. ej. script `curl` en su doc).

Si dos herramientas piden **Node distinto**, usar `nvm`/`fnm` o documentar en notas locales qué versión usa cada una (sin pegar secretos).

## Fase D — Repo MISC en el host

Clonar o actualizar en una ruta fija (ej. `~/MISC`):

```bash
cd ~
git clone https://github.com/devogsorg/MISC.git MISC   # primera vez; o URL SSH (`git@github.com:devogsorg/MISC.git`)
cd MISC && git checkout main && git pull
```

Para `git@github.com:...` hace falta clave SSH autorizada en GitHub.

## Fase E — Rutina con tmux y personas

1. `ssh` al servidor.
2. `tmux new -s misc` o `tmux attach -t misc`.
3. `cd ~/MISC` (o la ruta elegida); `git pull` si toca.
4. Elegir rol en el prompt del agente:
   - Infra / deploy: [agents/devops-agent.md](agents/devops-agent.md)
   - Código acotado: [agents/code-ops-agent.md](agents/code-ops-agent.md)
5. Lanzar la CLI elegida; tareas largas solo dentro de tmux.

**Comandos tmux útiles:** desconectar `Ctrl+b` luego `d`; listar `tmux ls`.

**Dry run sugerido:** pedir al agente que liste un archivo de `docs/` o un cambio trivial en rama de prueba, sin tocar Docker ni volúmenes.

### Alias opcionales (`~/.bashrc`)

```bash
alias misc-tmux='tmux attach -t misc 2>/dev/null || tmux new -s misc'
alias misc-cd='cd ~/MISC'
```

## Fase F — Headless

Checklist: [server-headless-cutover.md](server-headless-cutover.md).

## Referencias

- [server-24x7-ssh.md](server-24x7-ssh.md)
- [cli-tools-runbook.md](cli-tools-runbook.md)

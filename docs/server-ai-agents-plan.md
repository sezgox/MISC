# Plan: agentes de IA en el servidor (SSH + consola)

Objetivo: poder entrar por **SSH** desde fuera de casa y ejecutar **agentes en el host** (fixes rápidos, pequeñas features, deploy con scripts, estado del servidor), con **sesiones estables** y **secretos fuera del repo**.

Este plan es **independiente** del paso a host headless (sin GUI): puedes completar agentes + tmux primero y dejar headless para cuando toque.

## Prerrequisitos ya cubiertos

- SSH endurecido y usuarios permitidos (`sezgox`, `deploy`) — [server-24x7-ssh.md](server-24x7-ssh.md).
- Validación de acceso remoto (p. ej. móvil con datos → servidor en Wi‑Fi): suficiente para confiar en operación solo por SSH.

## 1) Secretos: qué es distinto de GitHub

| Origen | Uso |
|--------|-----|
| **GitHub Secrets** | Jobs de Actions / runner en CI. No se inyectan solos en tu sesión SSH. |
| **Agente en shell (servidor)** | Necesita credenciales **en el host** (login de cada CLI, o variables en ficheros locales no versionados). |

Política recomendada (**segura y sencilla**), en este orden:

1. **Login oficial de cada CLI** (device flow / `login` donde exista), de modo que el token quede en `~/.config/<vendor>/` (o ruta documentada por la herramienta), con permisos por defecto del propio programa. **Una vez por herramienta y usuario** (`sezgox` o `deploy`, según con cuál vayas a operar).
2. Si alguna CLI solo acepta **variable de entorno**: un fichero **fuera del repo**, por ejemplo `~/.config/misc-agent-secrets/<nombre>.env`, `chmod 600`, propietario tu usuario. Contenido mínimo: `export NOMBRE_API_KEY=...`. **No** commitear; **no** pegar valores en prompts del agente si se puede evitar.
3. Cargar secretos **solo cuando vayas a usar el agente** (menos superficie que exportar todo en cada login SSH):

   ```bash
   # Ejemplo: sesión dedicada
   source ~/.config/misc-agent-secrets/ejemplo.env
   ```

4. **Prohibido** por política del repo: secretos en git, en logs pegados a chats, o en historial de shell con `HISTFILE` sin cuidado (evitar `echo $API_KEY`; usar `read` o ficheros `source`).

Si más adelante queréis endurecer: segundo usuario solo-lectura, `sudo` acotado, o gestor de secretos (p. ej. `pass`); no es obligatorio para arrancar.

## 2) Herramientas: orden de instalación

Instalar **una CLI, validar, luego la siguiente** (menos fricción con PATH, auth y dependencias).

1. **Base útil en el servidor**: `git`, `curl`, `tmux`, y lo que pida la primera CLI (p. ej. Node LTS si alguna es vía `npm`/`npx`).
2. **Cursor CLI** — seguir documentación oficial de instalación para Linux; comprobar `which` / versión y un comando mínimo de ayuda o versión.
3. **Codex CLI** (OpenAI u otra variante con ese nombre) — misma pauta: doc oficial, smoke test.
4. **OpenCode CLI** — doc oficial del proyecto; smoke test.

En cada paso: **mismo usuario** con el que operarás por SSH (recomendación: `sezgox` para trabajo interactivo; reservar `deploy` si queréis separar más adelante).

No hace falta tener las tres terminadas antes de usar el servidor en serio: con **una** bien configurada ya tenéis agente útil.

## 3) tmux (sesiones persistentes)

- Crear una sesión al conectar: `tmux new -s misc` (o nombre fijo que recordéis).
- Desconectar sin matar: `Ctrl-b` luego `d`.
- Reconectar: `tmux attach -t misc`.
- Trabajar **siempre** el agente largo dentro de tmux para que un corte de Wi‑Fi en el móvil no mate el proceso.

Opcional: alias en `~/.bashrc` / `~/.zshrc` (`attach-misc`, etc.) cuando lo defináis en la fase de dotfiles.

## 4) Dos personas (prompts / reglas)

| Rol | Documento canónico | Alcance típico |
|-----|-------------------|----------------|
| **DevOps** | [agents/devops-agent.md](agents/devops-agent.md) | Workflows, Docker/Compose, túnel, scripts `deploy-part`, teardown con guardrails, estado de contenedores y red. |
| **Código / repo** | [agents/code-ops-agent.md](agents/code-ops-agent.md) | Cambios pequeños en el monorepo, estilos, bugs rápidos, sin sustituir el pipeline de producto cuando no toque infra. |

Las **skills** del repo (y `AGENTS.md` por app) son consumibles por el agente **si** la herramienta trabaja sobre el árbol del repo clonado en el servidor; conviene tener el repo actualizado (`git pull` en `main` o rama acordada) antes de tareas largas.

## 5) Acciones permitidas (resumen para instrucciones al agente)

Alineado con lo que comentaste; refinar en cada sesión si hace falta.

**DevOps**

- `docker compose ps`, logs razonables, comprobaciones HTTP internas/tras borde según runbooks.
- Relanzar / desplegar con **scripts ya existentes** del repo (`deploy-part`, etc.), no inventar `down -v` en rutina.
- Estado del servidor: disco, servicios relevantes, conectividad básica.

**Código**

- Features pequeñas, fixes de estilo o bugs acotados; respetar estructura y convenciones del repo.
- No tocar secretos reales ni commitear `.env` de producción.

**Prohibido por defecto** (salvo política explícita + backup)

- Teardown destructivo, borrado de volúmenes DB, credenciales en git.

Detalle de persistencia DB: [devops-agent.md — Guardrails](agents/devops-agent.md#guardrails-de-persistencia-db-obligatorio).

## 6) Checklist de ejecución (orden sugerido)

- [ ] Elegir usuario SSH para agentes (p. ej. `sezgox`) y ceñirse a él para auth de CLIs.
- [ ] Instalar dependencias base + `tmux`.
- [ ] Instalar **primera** CLI; login o `*.env` local según sección 1; verificar comando de ayuda/versión.
- [ ] Clonar o actualizar repo MISC en ruta conocida en el servidor.
- [ ] Abrir `tmux`, probar un comando corto del agente (lectura de archivos o tarea mínima).
- [ ] Repetir para segunda/tercera CLI si las necesitáis.
- [ ] Documentar en notas personales qué quedó instalado y bajo qué usuario (sin pegar secretos).

## 7) Fase headless (más adelante)

Cuando paséis a multi-user sin display manager: este plan **no** cambia la idea de agentes (sigue siendo SSH + tmux + CLIs). Checklist y rollback: [server-headless-cutover.md](server-headless-cutover.md).

## 8) Ejecución en el servidor (orden manual)

Guía operativa (comandos, tmux, enlaces a instalación oficial): [server-ai-agents-execution.md](server-ai-agents-execution.md).

## Referencias

- SSH y host 24/7: [server-24x7-ssh.md](server-24x7-ssh.md)
- CLI y logs operativos: [cli-tools-runbook.md](cli-tools-runbook.md)
- Monitoring: [monitoring-runbook.md](monitoring-runbook.md)
- Entrada monorepo para agentes: [AGENTS.md](../AGENTS.md)

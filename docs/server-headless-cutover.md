# Corte a host headless (laptop/servidor sin GUI)

Objetivo: arrancar en **`multi-user.target`** sin entorno gráfico local, manteniendo **SSH**, **Docker/Compose** y lo que ya tengas en consola (tmux, agentes CLI) según [server-ai-agents-execution.md](server-ai-agents-execution.md).

## Antes del corte (obligatorio)

1. **SSH probado** desde otra red (móvil con datos, otra Wi‑Fi, etc.).
2. **Clave SSH** en `authorized_keys`; **no** depender de contraseña si la deshabilitaste.
3. Tras un **reboot de prueba**, poder entrar por SSH y verificar:
   - `systemctl is-active ssh` → `active`
   - `docker info` y al menos un `docker compose ps` en un stack que uses
4. Anotar el **display manager** para rollback (en el host PWs documentado: **`gdm.service`**).

## 1) Display manager (este equipo: `gdm.service`)

Servicio confirmado: **`gdm.service`**. Si en otra máquina no fuera GDM:

```bash
systemctl status display-manager.service
dpkg -l | grep -E 'gdm3|lightdm|sddm'
```

## 2) Fijar arranque en consola (multi-usuario)

Hazlo **antes** de reiniciar la primera vez sin GUI:

```bash
sudo systemctl set-default multi-user.target
```

Así el objetivo por defecto es **solo texto** (getty en TTY); no arranca el stack gráfico salvo que lo invoques a mano.

## 3) Deshabilitar y parar GDM

```bash
sudo systemctl disable --now gdm.service
```

Comprueba:

```bash
systemctl is-enabled gdm.service   # debe ser disabled
systemctl status gdm.service       # inactive (dead)
```

No deshabilitar **`NetworkManager`**, **`ssh`**, **`docker`** ni el **runner** de Actions salvo que sepas el impacto.

## 4) Reiniciar y validar

```bash
sudo reboot
```

Tras el arranque:

1. **SSH** desde otro equipo: `ssh usuario@host`.
2. `docker info`, `docker compose ps` donde corresponda.
3. `tmux ls` / tu rutina habitual.

Si **no** tienes red: en el portátil puedes usar **TTY local**: `Ctrl+Alt+F3` (o F2–F6), login en texto, diagnosticar (`ip a`, `sudo systemctl status ssh`).

## Rollback (volver a GUI)

```bash
sudo systemctl set-default graphical.target
sudo systemctl enable --now gdm.service
sudo reboot
```

## Notas

- **Sin GUI** no hace falta desinstalar paquetes `ubuntu-desktop` para cumplir el objetivo; con **multi-user** + **DM deshabilitado** suele bastar. Desinstalar metapaquetes gráficos puede romper dependencias; hazlo solo si sabes qué quitas.
- **Tailscale / VPN** y **Cloudflare** siguen igual si sus servicios están en systemd y no dependían de sesión gráfica.
- Las **CLIs** de agentes en `~/.local/bin` o `PATH` **no** requieren escritorio.

## Referencias

- SSH y host 24/7: [server-24x7-ssh.md](server-24x7-ssh.md)
- CLI y logs: [cli-tools-runbook.md](cli-tools-runbook.md)

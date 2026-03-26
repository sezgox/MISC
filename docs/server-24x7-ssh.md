# Phase 1: 24/7 host + secure SSH access

This guide configures a Linux laptop as an always-on host with secure remote SSH access.
It is designed to be executed on Ubuntu-like systems with `systemd`.

Run the sections below manually in order. When you execute `tailscale up`,
complete the browser authentication prompt once.

## 0) Current host baseline (already verified)

- SSH service: enabled and running (`ssh.service`)
- Docker and Docker Compose: installed
- User `sezgox` is in `docker` and `sudo` groups
- `tailscale` is not installed yet
- `~/.ssh/authorized_keys` is missing (must be created for key-only SSH)

## 1) Keep host awake 24/7

Run as root (or with `sudo`):

```bash
sudo cp /etc/systemd/logind.conf /etc/systemd/logind.conf.bak.$(date +%F-%H%M%S)
sudo tee /etc/systemd/logind.conf >/dev/null <<'EOF'
[Login]
HandleSuspendKey=ignore
HandleHibernateKey=ignore
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
IdleAction=ignore
EOF
sudo systemctl restart systemd-logind
```

Optional hard-block suspend/hibernate targets:

```bash
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

## 2) Install and enable Tailscale (recommended remote access)

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo systemctl enable --now tailscaled
sudo tailscale up --ssh --hostname "$(hostname)-srv"
```

After `tailscale up`, complete the browser auth flow once.

Check status:

```bash
tailscale status
tailscale ip -4
```

## 3) SSH hardening (key-only, no root login)

### 3.1 Ensure your public key is authorized

If `~/.ssh/authorized_keys` does not exist:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3.2 Add explicit hardening drop-in

```bash
sudo mkdir -p /etc/ssh/sshd_config.d
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf >/dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers sezgox deploy
X11Forwarding no
EOF
sudo sshd -t
sudo systemctl restart ssh
```

## 4) Network exposure policy

Recommended: do **not** expose port 22 publicly on router/firewall.
Use Tailscale as private network path and SSH to the Tailscale IP.

If using UFW:

```bash
sudo ufw allow in on tailscale0 to any port 22 proto tcp
sudo ufw deny 22/tcp
sudo ufw reload
sudo ufw status verbose
```

## 5) Ops user and deploy compatibility checks

```bash
id
groups
docker --version
docker compose version
systemctl is-enabled ssh
systemctl is-active ssh
```

## 6) End-to-end validation

From another device in your tailnet:

```bash
ssh sezgox@<tailscale-ip-or-hostname>
# o si entras con usuario de operaciones
ssh deploy@<tailscale-ip-or-hostname>
```

Then validate runtime:

```bash
hostname
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Optional persistent admin session:

```bash
sudo apt-get update && sudo apt-get install -y tmux
tmux new -s ops
```

## 7) Recovery checklist

- After reboot:
  - `systemctl is-active ssh`
  - `systemctl is-active tailscaled`
  - `tailscale status`
- If SSH fails after hardening:
  - local console login
  - `sudo mv /etc/ssh/sshd_config.d/99-hardening.conf /etc/ssh/sshd_config.d/99-hardening.conf.off`
  - `sudo systemctl restart ssh`
- If you need to re-enable sleep targets:

```bash
sudo systemctl unmask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

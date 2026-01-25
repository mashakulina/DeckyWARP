#!/bin/bash
set +e

sudo echo "== Stopping DeckyWARP and related services =="

sudo systemctl stop plugin_loader.service || true
sudo systemctl stop warp-svc.service || true
sudo systemctl disable warp-svc.service || true
sudo systemctl reset-failed warp-svc.service || true

sudo systemctl --user stop warp-taskbar.service || true
sudo systemctl --user disable warp-taskbar.service || true
sudo systemctl --user reset-failed warp-taskbar.service || true

sudo pkill -f warp-taskbar || true
sudo pkill -f warp-tray || true
sudo pkill -f warp-client || true
sudo pkill -f warp-svc || true

sudo echo "== Removing old plugin and dependencies =="

sudo steamos-readonly disable || true

sudo rm -rf /home/deck/homebrew/plugins/DeckyWARP || true
sudo rm -rf /home/deck/homebrew/plugins/decky-warp || true

sudo pacman -Rns --noconfirm cloudflare-warp-bin chaotic-keyring chaotic-mirrorlist || true
sudo sed -i '/\[chaotic-aur\]/,+1d' /etc/pacman.conf || true
sudo rm -rf /etc/pacman.d/gnupg || true

sudo pacman -Sc --noconfirm || true

sudo rm -f /tmp/.warp_installing /tmp/warp_install.log /tmp/warp_install.sh || true
sudo systemctl reset-failed warp-install.service || true

sudo rm -f /usr/share/applications/warp*.desktop || true
sudo rm -f /home/deck/.config/autostart/warp*.desktop || true

sudo steamos-readonly enable || true

sudo systemctl start plugin_loader.service || true

sudo echo "✅ DeckyWARP uninstalled."

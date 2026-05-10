import asyncio, subprocess, time, pathlib, os

# ── logging ──────────────────────────────────────────────

def log_to_file(msg: str):
    try:
        with open("/tmp/deckywarp.log", "a", encoding="utf-8") as f:
            f.write(msg + "\n")
    except Exception:
        pass

# ── constants ────────────────────────────────────────────

WARP_BIN = "/usr/bin/warp-cli"
TIMEOUT = 30

# --- install warp-cli ---
FLAG = pathlib.Path("/tmp/.warp_installing")
LOG = pathlib.Path("/tmp/warp_install.log")
UNIT = "warp-install"
TOS_DONE = pathlib.Path("/tmp/.warp_tos_done")

# --- plugin update/check ---  ⬅️ new unified flags/units
UPD_FLAG = pathlib.Path("/tmp/.deckywarp_updating")
UPD_LOG = pathlib.Path("/tmp/deckywarp_update.log")
UPD_UNIT = "deckywarp-update"

CHK_FLAG = pathlib.Path("/tmp/.deckywarp_checking")
CHK_LOG = pathlib.Path("/tmp/deckywarp_check.log")
CHK_UNIT = "deckywarp-check"

# ── helpers ───────────────────────────────────────────────

def _clean_env():
    """Return a copy of os.environ *без* LD_LIBRARY_PATH, чтобы subprocess
    использовал системные библиотеки, а не Steam Runtime Decky Loader."""
    env = os.environ.copy()
    env.pop("LD_LIBRARY_PATH", None)
    return env


def _unit_state(name):
    try:
        return subprocess.check_output(
            ["systemctl", "show", name, "-p", "ActiveState"],
            text=True,
            env=_clean_env(),
        ).strip().split("=", 1)[1]
    except subprocess.CalledProcessError:
        return "inactive"


def _run_q(*cmd):
    return subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=_clean_env(),
    )


def _raw_status():
    res = subprocess.run(
        ["script", "-q", "-c", f"{WARP_BIN} status", "/dev/null"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=_clean_env(),
    )
    return ((res.stdout or "") + "\n" + (res.stderr or "")).strip()


# ---------- generic flag helpers -------------------------------------------

def _cleanup_flag(flag: pathlib.Path, unit_name: str):
    if flag.exists() and _unit_state(unit_name) in ("inactive", "failed"):
        flag.unlink(missing_ok=True)


def _busy(flag: pathlib.Path):
    return flag.exists()

# ── warp-cli state helpers ─────────────────────────────────────────────────
def _state():
    _cleanup_flag(FLAG, UNIT)

    if FLAG.exists():
        return "installing"

    if not pathlib.Path(WARP_BIN).exists():
        return "missing"

    # 🔑 ИСТОЧНИК ИСТИНЫ — systemd
    svc = _run_q("systemctl", "is-active", "warp-svc.service").stdout.strip()

    if svc == "active":
        return "connected"

    if svc in ("inactive", "failed"):
        return "disconnected"

    return "error"

# ── Mode detection helper ───────────────────────────────────────────────────
def _get_current_mode():
    """Получить текущий установленный режим из warp-cli settings"""
    if not pathlib.Path(WARP_BIN).exists():
        return "unknown"

    try:
        # Получаем настройки
        result = subprocess.run(
            [WARP_BIN, "--accept-tos", "settings"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=_clean_env(),
        )

        if result.returncode != 0:
            return "unknown"

        settings = result.stdout
        # Ищем строку с Mode:
        for line in settings.split('\n'):
            if 'Mode:' in line and '(user set)' in line:
                # Извлекаем значение после Mode:
                parts = line.split('Mode:')
                if len(parts) > 1:
                    mode = parts[1].strip()
                    # Маппинг на стандартные названия
                    mode_mapping = {
                        'Warp': 'warp',
                        'DnsOverHttps': 'doh',
                        'WarpWithDnsOverHttps': 'warp+doh'
                    }
                    return mode_mapping.get(mode, mode.lower())

        # Если не нашли, пробуем через warp-cli mode
        result = subprocess.run(
            [WARP_BIN, "mode"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=_clean_env(),
        )

        if result.returncode == 0:
            output = result.stdout.strip().lower()
            if 'warp+doh' in output:
                return 'warp+doh'
            elif 'doh' in output:
                return 'doh'
            elif 'warp' in output:
                return 'warp'

        return 'unknown'
    except Exception as e:
        log_to_file(f"Error getting mode: {e}")
        return 'unknown'

# ── async wrappers ----------------------------------------------------------

async def _run(*cmd):
    await asyncio.to_thread(subprocess.run, cmd, check=False, env=_clean_env())


async def _wait(desired):
    end = time.time() + TIMEOUT
    while time.time() < end and _state() != desired:
        await asyncio.sleep(0.5)
    return _state()


async def _register():
    await _run("bash", "-c", f"printf 'y\n' | {WARP_BIN} registration new")
    await _run(WARP_BIN, "mode", "warp+doh")

# ── install-script ────────────────────────────────────────

INSTALL_SH = r"""#!/bin/bash
set -e
exec > >(tee -a /tmp/warp_install.log) 2>&1
echo "## start: $(date)"
# Проверяем и удаляем блокировку базы данных pacman
PACMAN_DB_LOCK="/usr/lib/holo/pacmandb/db.lck"
if [ -f "$PACMAN_DB_LOCK" ]; then
    echo "Found pacman db lock file, removing..."
    sudo rm -f "$PACMAN_DB_LOCK"
    echo "Lock file removed."
fi
steamos-readonly status | grep -q disabled || echo y | steamos-readonly disable
mount -o remount,rw /
rm -rf /etc/pacman.d/gnupg
install -dm700 /etc/pacman.d/gnupg
pacman-key --init
pacman-key --populate
pacman -Sy --noconfirm base-devel fakeroot curl
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm \
  'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' \
  'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
grep -q '\[chaotic-aur\]' /etc/pacman.conf || \
  echo -e '\n[chaotic-aur]\nInclude = /etc/pacman.d/chaotic-mirrorlist' >> /etc/pacman.conf

pacman -Sy --noconfirm

download_pkg() {
  local dest="$1"
  local url="$2"
  rm -f "$dest"
  if command -v curl >/dev/null 2>&1; then
    curl -fL --connect-timeout 45 --retry 3 -o "$dest" "$url" && return 0
  fi
  if command -v wget >/dev/null 2>&1; then
    wget -q --timeout=45 --tries=3 -O "$dest" "$url" && return 0
  fi
  return 1
}

# Рантайм GCC: на SteamOS/Holo обычно пакет gcc-libs (libgcc.so), отдельного libgcc нет.
# На классическом Arch в core бывает и libgcc — пробуем оба имени.
detect_gcc_runtime_pkg() {
  local n
  for n in gcc-libs libgcc; do
    if pacman -Si "$n" >/dev/null 2>&1; then
      printf '%s' "$n"
      return 0
    fi
  done
  return 1
}

install_gcc_runtime() {
  local PKG VER FNAME LIBGCC_URL
  PKG="$(detect_gcc_runtime_pkg)" || true
  if [ -z "$PKG" ]; then
    echo "ERROR: в синхронизированных репозиториях нет пакета gcc-libs ни libgcc (pacman -Si)."
    return 1
  fi
  echo "== gcc runtime: выбран пакет «${PKG}» (SteamOS чаще gcc-libs) =="

  echo "== gcc runtime: pacman -S (основной способ) =="
  if pacman -S --noconfirm --needed "$PKG"; then
    echo "gcc runtime (${PKG}): установлен через pacman."
    return 0
  fi

  echo "== gcc runtime: загрузка по URL из pacman -Sp =="
  LIBGCC_URL="$( (pacman -Sp "$PKG" 2>/dev/null || true) | head -n1 )"
  if [ -n "$LIBGCC_URL" ]; then
    if download_pkg "/tmp/${PKG}.pkg.tar.zst" "$LIBGCC_URL" \
      && pacman -U --noconfirm --overwrite='*' "/tmp/${PKG}.pkg.tar.zst"; then
      echo "gcc runtime (${PKG}): установлен из URL sync-репозитория."
      return 0
    fi
  fi

  echo "== gcc runtime: резервные зеркала Arch (имя из pacman -Si «${PKG}») =="
  VER="$(pacman -Si "$PKG" 2>/dev/null | awk -F': ' '$1 ~ /^Version/ {gsub(/^ +| +$/,"",$2); print $2; exit}')"
  if [ -z "$VER" ]; then
    echo "ERROR: не удалось получить Version для ${PKG} (pacman -Si)."
    return 1
  fi
  FNAME="${PKG}-${VER}-x86_64.pkg.tar.zst"
  for BASE in \
    "https://geo.mirror.pkgbuild.com/core/os/x86_64/${FNAME}" \
    "https://mirror.rackspace.com/archlinux/core/os/x86_64/${FNAME}" \
    "https://mirror.leaseweb.net/archlinux/core/os/x86_64/${FNAME}" \
    "https://ftp.lysator.liu.se/pub/archlinux/core/os/x86_64/${FNAME}"
  do
    echo "Пробуем: $BASE"
    if download_pkg "/tmp/${FNAME}" "$BASE" \
      && pacman -U --noconfirm --overwrite='*' "/tmp/${FNAME}"; then
      echo "gcc runtime (${PKG}): установлен с резервного зеркала."
      return 0
    fi
  done

  echo "ERROR: gcc runtime (${PKG}): все способы не сработали."
  return 1
}

# Chaotic cloudflare-warp-bin объявляет зависимость «libgcc» как отдельный пакет Arch.
# На SteamOS/Holo такого пакета нет (рантайм в gcc-libs), pacman блокирует -S и -U.
# Виртуальная зависимость: библиотеки уже на системе после gcc-libs; версия завышена под возможные «>=».
LIBGCC_ASSUME=( --assume-installed libgcc=99.0-1 )

# cloudflare-warp-bin: pacman, затем прямой .pkg по URL, затем индекс Chaotic.
install_cloudflare_warp_bin() {
  echo "== cloudflare-warp-bin: pacman -S (с --assume-installed для SteamOS) =="
  if pacman -S --noconfirm "${LIBGCC_ASSUME[@]}" cloudflare-warp-bin; then
    echo "cloudflare-warp-bin: установлен через pacman."
    return 0
  fi

  echo "== cloudflare-warp-bin: загрузка пакета по pacman -Sp (только строка с URL) =="
  WARP_URL="$(pacman -Sp cloudflare-warp-bin 2>/dev/null | grep -m1 -E '^https?://' | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)"
  if [ -n "$WARP_URL" ]; then
    if download_pkg /tmp/cloudflare-warp-bin.pkg.tar.zst "$WARP_URL" \
      && pacman -U --noconfirm "${LIBGCC_ASSUME[@]}" /tmp/cloudflare-warp-bin.pkg.tar.zst; then
      echo "cloudflare-warp-bin: установлен из .pkg.tar.zst (pacman -Sp)."
      return 0
    fi
    echo "warn: pacman -U с assume-installed не вышел, пробуем --nodeps для того же файла..."
    if pacman -U --noconfirm --nodeps /tmp/cloudflare-warp-bin.pkg.tar.zst; then
      echo "cloudflare-warp-bin: установлен из .pkg.tar.zst (--nodeps)."
      return 0
    fi
  fi

  echo "== cloudflare-warp-bin: последний резерв — список каталога Chaotic CDN =="
  IDX="$(curl -fsSL --connect-timeout 25 --retry 2 \
    'https://cdn-mirror.chaotic.cx/chaotic-aur/x86_64/' || true)"
  FPKG="$(echo "$IDX" | grep -oE 'href="cloudflare-warp-bin-[^"]+\.pkg\.tar\.zst"' \
    | sed 's/^href="//;s/"$//' | sort -V | tail -n1)"
  if [ -z "$FPKG" ]; then
    echo "ERROR: не найден cloudflare-warp-bin в индексе Chaotic."
    return 1
  fi
  LAST_URL="https://cdn-mirror.chaotic.cx/chaotic-aur/x86_64/${FPKG}"
  echo "Качаем: $LAST_URL"
  if download_pkg "/tmp/${FPKG}" "$LAST_URL"; then
    if pacman -U --noconfirm "${LIBGCC_ASSUME[@]}" "/tmp/${FPKG}"; then
      echo "cloudflare-warp-bin: установлен с Chaotic CDN (--assume-installed)."
      return 0
    fi
    echo "warn: пробуем --nodeps для скачанного пакета..."
    if pacman -U --noconfirm --nodeps "/tmp/${FPKG}"; then
      echo "cloudflare-warp-bin: установлен с Chaotic CDN (--nodeps)."
      return 0
    fi
  fi

  echo "ERROR: cloudflare-warp-bin: установка не удалась."
  return 1
}

cd /tmp
install_gcc_runtime || exit 1
install_cloudflare_warp_bin || exit 1

/usr/bin/warp-cli --accept-tos
/usr/bin/warp-cli registration new
systemctl enable --now warp-svc.service
/usr/bin/warp-cli mode warp+doh
/usr/bin/warp-cli connect || true
echo "## done: $(date)"
"""


def _write_script():
    p = pathlib.Path("/tmp/warp_install.sh")
    p.write_text(INSTALL_SH)
    p.chmod(0o755)
    LOG.write_text("")
    return str(p)

# ── update-script (plugin self‑update) ──────────────────────────────────────

UPDATE_SH = r"""#!/bin/bash
set -e
exec > >(tee -a /tmp/deckywarp_update.log) 2>&1
echo "== START UPDATE: $(date)"

PLUGIN_DIR="/home/deck/homebrew/plugins/DeckyWARP"
TMP_DIR="/tmp/deckywarp_update"
ZIP_URL="https://api.github.com/repos/mashakulina/DeckyWARP/releases/latest"

mkdir -p "$TMP_DIR"
cd "$TMP_DIR"

echo "== FETCHING ASSET URL =="
ASSET_URL=$(curl -s "$ZIP_URL" | grep '"zipball_url":' | cut -d '"' -f 4)
[ -z "$ASSET_URL" ] && echo "ERROR: no asset url" && exit 1
echo "Asset URL: $ASSET_URL"

echo "== DOWNLOADING ZIP =="
curl -L -o latest.zip "$ASSET_URL"
[ ! -f latest.zip ] && echo "ERROR: download failed" && exit 1
echo "Downloaded zip: $(du -h latest.zip)"

echo "== UNZIPPING =="
unzip -qo latest.zip || { echo "ERROR: unzip failed"; exit 1; }
INNER_DIR=$(find . -maxdepth 1 -type d -name "*DeckyWARP*" | head -n 1)
[ ! -d "$INNER_DIR" ] && echo "ERROR: inner dir not found" && exit 1
echo "Found unpacked dir: $INNER_DIR"

echo "== COPYING PLUGIN =="
BACKUP="${PLUGIN_DIR}_backup_$(date +%s)"
cp -r "$PLUGIN_DIR" "$BACKUP" || true
rm -r "$PLUGIN_DIR"
cp -r "$INNER_DIR" "$PLUGIN_DIR"
COPY_RESULT=$?

if [ $COPY_RESULT -eq 0 ]; then
  echo "== CLEANING BACKUP =="
  rm -r "$BACKUP"
  rm -r "$TMP_DIR"
  echo "== RESTARTING DECKY =="
  systemctl restart plugin_loader.service
  echo "== DONE: $(date)"
else
  echo "ERROR: update copy failed"
  exit 1
fi
"""


def _write_update_script():
    path = pathlib.Path("/tmp/deckywarp_update.sh")
    path.write_text(UPDATE_SH)
    path.chmod(0o755)
    return str(path)

# ── check-script (version check) ────────────────────────────────────────────

CHECK_SH = r"""#!/bin/bash
set -e
exec > >(tee -a /tmp/deckywarp_check.log) 2>&1
echo "== START CHECK: $(date)"

GITHUB_API_URL="https://api.github.com/repos/mashakulina/DeckyWARP/releases/latest"
PLUGIN_JSON_PATH="/home/deck/homebrew/plugins/DeckyWARP/plugin.json"

curl -s -H 'Accept: application/vnd.github+json' "$GITHUB_API_URL" > /tmp/github_response.json
LATEST=$(jq -r .tag_name /tmp/github_response.json | sed 's/^v//')
CURRENT=$(jq -r .version "$PLUGIN_JSON_PATH")

if [ "$LATEST" != "$CURRENT" ]; then
  echo "update_available $LATEST $CURRENT"
else
  echo "up_to_date $CURRENT"
fi

"""


def _write_check_script():
    p = pathlib.Path("/tmp/deckywarp_check.sh")
    p.write_text(CHECK_SH)
    p.chmod(0o755)
    return str(p)

# ── Decky plugin API ──────────────────────────────────────

class Plugin:
    async def _main(self): ...

    async def _unload(self):
        pass

    # ---------- WARP TOGGLE / STATE --------------------------------------

    async def get_state(self):
        return _state()

    async def toggle_warp(self):
        log_to_file("toggle_warp called")

        st = _state()
        log_to_file(f"Current state: {st}")

        if st in ("missing", "installing"):
            return st

        # ON → OFF
        if st == "connected":
            log_to_file("Stopping WARP service")
            await _run("systemctl", "stop", "warp-svc.service")
            await asyncio.sleep(1)
            return "disconnected"

        # OFF → ON
        log_to_file("Starting WARP service")
        # запускаем сервис
        await _run("systemctl", "start", "warp-svc.service")
        await asyncio.sleep(1)

        current_mode = _get_current_mode()
        mode_command = {
            'warp': 'warp',
            'doh': 'doh',
            'warp+doh': 'warp+doh'
        }.get(current_mode, 'warp')

        log_to_file(f"Connecting with mode: {mode_command}")
        await _run("script", "-q", "-c", f"{WARP_BIN} --accept-tos connect", "/dev/null")

        return "connected"

    # ---------- MODE MANAGEMENT -------------------------------------------

    async def get_current_mode(self):
        """Получить текущий установленный режим warp-cli"""
        return _get_current_mode()

    async def set_warp_mode(self, mode: str):
        """Установить режим работы warp-cli"""
        log_to_file(f"Setting warp mode to: {mode}")

        # Проверяем допустимые режимы
        valid_modes = ['warp', 'doh', 'warp+doh']
        if mode not in valid_modes:
            return {"status": "error", "detail": f"Invalid mode. Must be one of: {', '.join(valid_modes)}"}

        # Получаем текущий режим
        current_mode = _get_current_mode()

        # Если режим уже установлен, ничего не делаем
        if current_mode == mode:
            return {"status": "already_set", "mode": mode}

        # Устанавливаем новый режим
        try:
            result = await asyncio.to_thread(
                subprocess.run,
                [WARP_BIN, "--accept-tos", "mode", mode],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=_clean_env(),
            )

            if result.returncode == 0:
                log_to_file(f"Successfully set mode to {mode}")

                # Если WARP активен, переподключаем с новым режимом
                st = _state()
                if st == "connected":
                    log_to_file("Reconnecting with new mode")
                    await _run(WARP_BIN, "disconnect")
                    await asyncio.sleep(1)
                    await _run("script", "-q", "-c", f"{WARP_BIN} --accept-tos connect", "/dev/null")

                return {"status": "success", "mode": mode}
            else:
                log_to_file(f"Failed to set mode: {result.stderr}")
                return {"status": "error", "detail": result.stderr}

        except Exception as e:
            log_to_file(f"Error setting mode: {e}")
            return {"status": "error", "detail": str(e)}

    # ---------- INSTALL WARP-CLI -----------------------------------------

    async def install_warp(self):
        if FLAG.exists():
            return "installing"
        FLAG.touch()
        await _run("systemctl", "reset-failed", f"{UNIT}.service")
        await _run(
            "systemd-run",
            "--unit",
            UNIT,
            "--service-type=oneshot",
            "--quiet",
            _write_script(),
        )
        return "started"

    async def get_install_log(self):
        if LOG.exists():
            try:
                return LOG.read_text().splitlines()[-1][-160:]
            except Exception:
                pass
        return ""

    # ---------- PLUGIN UPDATE -------------------------------------------

    async def update_plugin(self):
        """Запускает обновление плагина - по аналогии с установкой WARP"""
        _cleanup_flag(UPD_FLAG, UPD_UNIT)
        if _busy(UPD_FLAG):
            return "updating"

        UPD_FLAG.touch()

        # Используем тот же подход, что и для установки WARP
        await _run("systemctl", "reset-failed", f"{UPD_UNIT}.service")

        result = await asyncio.to_thread(
            subprocess.run,
            [
                "systemd-run",
                "--unit", UPD_UNIT,
                "--service-type=oneshot",
                "--quiet",
                _write_update_script(),
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            log_to_file(f"Failed to start update unit: {result.stderr}")
            # Пробуем с sudo
            sudo_result = await asyncio.to_thread(
                subprocess.run,
                [
                    "sudo",
                    "systemd-run",
                    "--unit", f"{UPD_UNIT}_sudo",
                    "--service-type=oneshot",
                    "--quiet",
                    _write_update_script(),
                ],
                capture_output=True,
                text=True,
            )

            if sudo_result.returncode == 0:
                return "update_started_with_sudo"
            else:
                UPD_FLAG.unlink(missing_ok=True)
                return f"update_failed: {sudo_result.stderr[:100]}"

        return "update_started"

    # ---------- VERSION CHECK -------------------------------------------

    async def check_update(self):
        """Проверить доступность новой версии через отдельный systemd unit."""
        _cleanup_flag(CHK_FLAG, CHK_UNIT)
        if _busy(CHK_FLAG):
            return {"status": "checking"}
        CHK_FLAG.touch()
        await _run(
            "systemd-run", "--unit", CHK_UNIT,
            "--service-type=oneshot", "--quiet",
            _write_check_script(),
        )
        await asyncio.sleep(1)

        def _fetch_changelog():
            import urllib.request
            import ssl
            import json
            try:
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE

                with urllib.request.urlopen("https://api.github.com/repos/mashakulina/DeckyWARP/releases/latest", context=ctx) as resp:
                    data = json.load(resp)
                    body = data.get("body", "")
                    lines = body.splitlines()

                en_lines, ru_lines = [], []
                mode = 0  # 0 = none, 1 = EN, 2 = RU

                for line in lines:
                    if line.strip().startswith("## **Changelog**"):
                        mode = 1
                        continue
                    elif line.strip().startswith("## **Список изменений**"):
                        mode = 2
                        continue
                    elif line.strip().startswith("#"):
                        mode = 0
                        continue

                    if mode == 1:
                        en_lines.append(line)
                    elif mode == 2:
                        ru_lines.append(line)

                result = ""
                if en_lines:
                    result += "== EN ==\n" + "\n".join(en_lines).strip() + "\n"
                if ru_lines:
                    result += "\n== RU ==\n" + "\n".join(ru_lines).strip()
                return result or "[changelog empty]"
            except Exception as e:
                return f"[changelog error] {e}"

        if CHK_LOG.exists():
            try:
                lines = CHK_LOG.read_text().splitlines()
                for line in reversed(lines):
                    if line.startswith("update_available"):
                        parts = line.strip().split()
                        if len(parts) == 3:
                            return {
                                "status": "update_available",
                                "latest": parts[1],
                                "current": parts[2],
                                "changelog": _fetch_changelog()
                            }
                    elif line.startswith("up_to_date"):
                        parts = line.strip().split()
                        if len(parts) == 2:
                            return {
                                "status": "up_to_date",
                                "current": parts[1]
                            }
                return {"status": "error", "detail": "no update info in log"}
            except Exception as e:
                return {"status": "error", "detail": str(e)}
        return {"status": "error", "detail": "log not found"}

    # ---------- MISC -----------------------------------------------------

    async def clear_logs(self):
        try:
            for f in [
                "/tmp/deckywarp.log",
                UPD_LOG,
                CHK_LOG,
                LOG,
            ]:
                pathlib.Path(f).unlink(missing_ok=True)
            return "ok"
        except Exception as e:
            return f"error: {e}"

    async def stop_warp(self):
        await _run(WARP_BIN, "disconnect")


plugin = Plugin()

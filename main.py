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
UPD_LOCK = pathlib.Path("/tmp/deckywarp_update.lock")
UPD_LOG = pathlib.Path("/tmp/deckywarp_update.log")
UPD_UNIT = "deckywarp-update"

CHK_FLAG = pathlib.Path("/tmp/.deckywarp_checking")
CHK_LOCK = pathlib.Path("/tmp/deckywarp_check.lock")
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
    if not flag.exists():
        return
    state = _unit_state(unit_name)
    if state in ("inactive", "failed", "dead"):
        flag.unlink(missing_ok=True)


def _busy(flag: pathlib.Path):
    return flag.exists()


def _plugin_dir() -> pathlib.Path:
    deck_home = os.environ.get("DECKY_USER_HOME", "/home/deck")
    return pathlib.Path(deck_home) / "homebrew/plugins/DeckyWARP"


def _force_cleanup_update_flag():
    for unit in (UPD_UNIT, f"{UPD_UNIT}_sudo"):
        _cleanup_flag(UPD_FLAG, unit)
    if UPD_FLAG.exists() and _unit_state(UPD_UNIT) not in ("active", "activating"):
        UPD_FLAG.unlink(missing_ok=True)


def _update_unit_active():
    for unit in (UPD_UNIT, f"{UPD_UNIT}_sudo"):
        if _unit_state(unit) in ("active", "activating"):
            return unit
    return None


def _update_log_in_progress():
    if not UPD_LOG.exists():
        return False
    try:
        log = UPD_LOG.read_text()
    except Exception:
        return False
    if "== START UPDATE:" not in log:
        return False
    tail = log.split("== START UPDATE:")[-1]
    if "== DONE:" in tail or "ALREADY UP TO DATE" in tail:
        return False
    return True


def _update_is_running():
    return _update_unit_active() is not None or _update_log_in_progress()


def _read_update_log_text():
    if not UPD_LOG.exists():
        return ""
    try:
        lines = UPD_LOG.read_text().splitlines()
    except Exception:
        return ""

    meaningful = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if (
            s.startswith("== ")
            or s.startswith("ERROR:")
            or s.startswith("Current:")
            or s.startswith("Asset URL:")
            or s.startswith("Downloaded zip:")
            or s.startswith("Found unpacked")
            or s.startswith("Plugin dir:")
        ):
            meaningful.append(s)
            continue
        if "Dload" in s and "Upload" in s and "Total" in s:
            continue
        if s.startswith("curl:"):
            continue
        if len(s) > 0 and s[0].isdigit() and ("--:--:--" in s or "speed" in s.lower()):
            continue
    return "\n".join(meaningful[-50:])


def _parse_update_progress(log: str):
    stages = [
        ("done", 100, ["== DONE:", "ALREADY UP TO DATE"]),
        ("restart", 90, ["== RESTARTING DECKY =="]),
        ("install", 65, ["== INSTALLING FILES ==", "== COPYING PLUGIN ==", "== UNZIPPING =="]),
        ("download", 40, ["Downloaded zip:", "== DOWNLOADING ZIP =="]),
        ("fetch", 15, ["== FETCHING ASSET URL ==", "== START UPDATE:", "== UPDATE REQUESTED"]),
    ]

    best_id, best_percent, best_idx = "fetch", 5, -1
    for stage_id, percent, markers in stages:
        for marker in markers:
            idx = log.rfind(marker)
            if idx > best_idx:
                best_idx = idx
                best_id, best_percent = stage_id, percent

    progress_markers = [
        "== RESTARTING DECKY ==",
        "== INSTALLING FILES ==",
        "== UNZIPPING ==",
        "== DOWNLOADING ZIP ==",
        "== FETCHING ASSET URL ==",
        "== START UPDATE:",
    ]
    last_progress = -1
    for marker in progress_markers:
        idx = log.rfind(marker)
        if idx > last_progress:
            last_progress = idx
    failed = "ERROR:" in log and "== DONE:" not in log and log.rfind("ERROR:") > last_progress

    done = "== DONE:" in log or "ALREADY UP TO DATE" in log
    return {
        "step": best_id,
        "percent": best_percent,
        "done": done,
        "failed": failed,
    }


def _parse_check_log():
    if not CHK_LOG.exists():
        return None
    try:
        lines = CHK_LOG.read_text().splitlines()
        start_idx = 0
        for i, line in enumerate(lines):
            if line.startswith("== START CHECK:") or line.startswith("== CHECK REQUESTED:"):
                start_idx = i
        for line in reversed(lines[start_idx:]):
            if line.startswith("update_available"):
                parts = line.strip().split()
                if len(parts) == 3:
                    return {
                        "status": "update_available",
                        "latest": parts[1],
                        "current": parts[2],
                    }
            elif line.startswith("up_to_date"):
                parts = line.strip().split()
                if len(parts) == 2:
                    return {"status": "up_to_date", "current": parts[1]}
            elif "ERROR:" in line:
                return {"status": "error", "detail": line.strip()}
        return None
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _fetch_changelog():
    import urllib.request
    import ssl
    import json
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        with urllib.request.urlopen(
            "https://api.github.com/repos/mashakulina/DeckyWARP/releases/latest",
            context=ctx,
        ) as resp:
            data = json.load(resp)
            body = data.get("body", "")
            lines = body.splitlines()

        en_lines, ru_lines = [], []
        mode = 0

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


async def _wait_for_check_result(timeout=45):
    deadline = time.time() + timeout
    unit_done_at = None
    seen_active = False
    while time.time() < deadline:
        parsed = _parse_check_log()
        if parsed:
            if parsed["status"] == "update_available":
                parsed["changelog"] = await asyncio.to_thread(_fetch_changelog)
            return parsed

        main_state = _unit_state(CHK_UNIT)
        sudo_state = _unit_state(f"{CHK_UNIT}_sudo")
        if main_state in ("active", "activating") or sudo_state in ("active", "activating"):
            seen_active = True
            unit_done_at = None
        elif seen_active:
            if unit_done_at is None:
                unit_done_at = time.time()
            elif time.time() - unit_done_at > 2:
                parsed = _parse_check_log()
                if parsed:
                    if parsed["status"] == "update_available":
                        parsed["changelog"] = await asyncio.to_thread(_fetch_changelog)
                    return parsed
                break

        await asyncio.sleep(0.5)

    return None

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

PACMAN_CONF_BAK="/tmp/pacman.conf.deckywarp.bak"
PACMAN_RESTORED=0
READONLY_ENABLED=0

modify_pacman_conf() {
  local action="$1"
  echo "Изменяем pacman.conf ($action)..."
  if [ "$action" = "enable" ]; then
    sed -i 's/Required DatabaseOptional/TrustAll/g' /etc/pacman.conf
    echo "Режим установки: TrustAll активирован в pacman.conf"
  else
    sed -i 's/TrustAll/Required DatabaseOptional/g' /etc/pacman.conf
    echo "Required DatabaseOptional восстановлен в pacman.conf"
  fi
}

restore_pacman_conf() {
  if [ "$PACMAN_RESTORED" = 1 ]; then
    return 0
  fi
  if [ -f "$PACMAN_CONF_BAK" ]; then
    cp "$PACMAN_CONF_BAK" /etc/pacman.conf
    echo "pacman.conf восстановлен из резервной копии"
  else
    modify_pacman_conf disable
  fi
  PACMAN_RESTORED=1
}

enable_readonly() {
  if [ "$READONLY_ENABLED" = 1 ]; then
    return 0
  fi
  echo "Включаем steamos-readonly..."
  steamos-readonly enable || echo "warn: не удалось включить steamos-readonly"
  READONLY_ENABLED=1
}

finalize_system() {
  restore_pacman_conf
  enable_readonly
}
trap finalize_system EXIT

# Проверяем и удаляем блокировку базы данных pacman
PACMAN_DB_LOCK="/usr/lib/holo/pacmandb/db.lck"
if [ -f "$PACMAN_DB_LOCK" ]; then
    echo "Found pacman db lock file, removing..."
    rm -f "$PACMAN_DB_LOCK"
    echo "Lock file removed."
fi

steamos-readonly status | grep -q disabled || echo y | steamos-readonly disable
mount -o remount,rw /

cp /etc/pacman.conf "$PACMAN_CONF_BAK"
modify_pacman_conf enable

grep -q '\[chaotic-aur\]' /etc/pacman.conf || \
  echo -e '\n[chaotic-aur]\nInclude = /etc/pacman.d/chaotic-mirrorlist' >> /etc/pacman.conf

echo "Инициализируем ключи pacman..."
pacman-key --init
pacman-key --populate
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm \
  'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' \
  'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

echo "Обновляем базу данных pacman..."
pacman -Sy --noconfirm

pacman -S --noconfirm --needed base-devel fakeroot curl

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

# Chaotic cloudflare-warp-bin объявляет зависимости «libgcc» и «libstdc++» как отдельные пакеты Arch.
# На SteamOS/Holo их нет (рантайм в gcc-libs); версии завышены под возможные «>=».
WARP_ASSUME=(
  --assume-installed libgcc=99.0-1
  --assume-installed libstdc++=99.0-1
)

install_warp_pkg_file() {
  local pkg="$1"
  local label="$2"

  pacman -Rdd --noconfirm cloudflare-warp-bin 2>/dev/null || true

  echo "== cloudflare-warp-bin: pacman -U ${label} (assume-installed) =="
  if pacman -U --noconfirm "${WARP_ASSUME[@]}" --overwrite='*' "$pkg"; then
    return 0
  fi

  echo "== cloudflare-warp-bin: pacman -U ${label} (--nodeps) =="
  if pacman -U --noconfirm --nodeps --overwrite='*' "$pkg"; then
    return 0
  fi

  echo "== cloudflare-warp-bin: bsdtar + --dbonly ${label} =="
  if command -v bsdtar >/dev/null 2>&1; then
    bsdtar -xpf "$pkg" -C /
    if pacman -U --noconfirm --dbonly --nodeps "$pkg"; then
      return 0
    fi
    pacman -Q cloudflare-warp-bin >/dev/null 2>&1 && return 0
  fi

  return 1
}

# cloudflare-warp-bin: pacman, затем прямой .pkg по URL, затем индекс Chaotic.
install_cloudflare_warp_bin() {
  echo "== cloudflare-warp-bin: pacman -S (с --assume-installed для SteamOS) =="
  if pacman -S --noconfirm "${WARP_ASSUME[@]}" cloudflare-warp-bin; then
    echo "cloudflare-warp-bin: установлен через pacman."
    return 0
  fi

  echo "== cloudflare-warp-bin: загрузка пакета по pacman -Sp (только строка с URL) =="
  WARP_URL="$(pacman -Sp cloudflare-warp-bin 2>/dev/null | grep -m1 -E '^https?://' | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)"
  if [ -n "$WARP_URL" ]; then
    if download_pkg /tmp/cloudflare-warp-bin.pkg.tar.zst "$WARP_URL" \
      && install_warp_pkg_file /tmp/cloudflare-warp-bin.pkg.tar.zst "pacman -Sp"; then
      echo "cloudflare-warp-bin: установлен из .pkg.tar.zst (pacman -Sp)."
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
  if download_pkg "/tmp/${FPKG}" "$LAST_URL" \
    && install_warp_pkg_file "/tmp/${FPKG}" "Chaotic CDN"; then
    echo "cloudflare-warp-bin: установлен с Chaotic CDN."
    return 0
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

def _update_sh_content() -> str:
    plugin_dir = _plugin_dir()
    deck_user = os.environ.get("DECKY_USER", "deck")
    return f"""#!/bin/bash
LOG="{UPD_LOG}"
FLAG="{UPD_FLAG}"
LOCK="{UPD_LOCK}"
PLUGIN_DIR="{plugin_dir}"
DECK_USER="{deck_user}"
TMP_DIR="/tmp/deckywarp_update"
GITHUB_API_URL="https://api.github.com/repos/mashakulina/DeckyWARP/releases/latest"
PLUGIN_JSON_PATH="{plugin_dir}/plugin.json"
RELEASE_JSON="/tmp/deckywarp_release.json"

exec 200>"$LOCK"
if ! flock -n 200; then
  exit 0
fi

exec >> "$LOG" 2>&1
set -e
trap 'rm -f "$FLAG"' EXIT

echo "== START UPDATE: $(date)"
echo "Plugin dir: $PLUGIN_DIR"

mkdir -p "$TMP_DIR"
cd "$TMP_DIR"

fetch_release() {{
  curl -sf --connect-timeout 30 --retry 3 --retry-delay 2 \\
    -H 'Accept: application/vnd.github+json' \\
    -H 'User-Agent: DeckyWARP-Update' \\
    "$GITHUB_API_URL" -o "$RELEASE_JSON"
}}

echo "== FETCHING ASSET URL =="
if ! fetch_release; then
  echo "ERROR: failed to fetch release info from GitHub"
  [ -f "$RELEASE_JSON" ] && echo "Response: $(cat "$RELEASE_JSON")"
  exit 1
fi

LATEST=$(jq -r .tag_name "$RELEASE_JSON" | sed 's/^v//')
CURRENT=$(jq -r .version "$PLUGIN_JSON_PATH")
echo "Current: $CURRENT, Latest: $LATEST"

if [ "$LATEST" = "$CURRENT" ]; then
  echo "== ALREADY UP TO DATE: $CURRENT =="
  exit 0
fi

ASSET_URL=$(jq -r .zipball_url "$RELEASE_JSON")
if [ -z "$ASSET_URL" ] || [ "$ASSET_URL" = "null" ]; then
  echo "ERROR: no asset url"
  echo "API response: $(cat "$RELEASE_JSON")"
  exit 1
fi
echo "Asset URL: $ASSET_URL"

echo "== DOWNLOADING ZIP =="
curl -fsSL --connect-timeout 45 --retry 3 --retry-delay 2 -o latest.zip "$ASSET_URL" 2>/dev/null
[ ! -f latest.zip ] && echo "ERROR: download failed" && exit 1
echo "Downloaded zip: $(du -h latest.zip)"

echo "== UNZIPPING =="
unzip -qo latest.zip || {{ echo "ERROR: unzip failed"; exit 1; }}
INNER_DIR=$(find . -maxdepth 1 -type d -name "*DeckyWARP*" | head -n 1)
[ ! -d "$INNER_DIR" ] && echo "ERROR: inner dir not found" && exit 1
echo "Found unpacked dir: $INNER_DIR"

echo "== INSTALLING FILES =="
mkdir -p "$PLUGIN_DIR"
find "$PLUGIN_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {{}} + 2>/dev/null || true
cp -a "$INNER_DIR"/. "$PLUGIN_DIR"/
chown -R "$DECK_USER:$DECK_USER" "$PLUGIN_DIR" 2>/dev/null || true

echo "== CLEANING TEMP =="
rm -rf "$TMP_DIR"

echo "== RESTARTING DECKY =="
systemctl restart plugin_loader.service
echo "== DONE: $(date)"
"""


def _write_update_script():
    path = pathlib.Path("/tmp/deckywarp_update.sh")
    path.write_text(_update_sh_content())
    path.chmod(0o755)
    return str(path)

# ── check-script (version check) ────────────────────────────────────────────

CHECK_SH = r"""#!/bin/bash
LOG="/tmp/deckywarp_check.log"
FLAG="/tmp/.deckywarp_checking"
LOCK="/tmp/deckywarp_check.lock"

exec 201>"$LOCK"
if ! flock -n 201; then
  echo "ERROR: another check is already running" >> "$LOG"
  exit 1
fi

exec >> "$LOG" 2>&1
set -e
trap 'rm -f "$FLAG"' EXIT

echo "== START CHECK: $(date)"

GITHUB_API_URL="https://api.github.com/repos/mashakulina/DeckyWARP/releases/latest"
PLUGIN_JSON_PATH="__PLUGIN_JSON__"

curl -sf --connect-timeout 30 --retry 3 --retry-delay 2 \
  -H 'Accept: application/vnd.github+json' \
  -H 'User-Agent: DeckyWARP-Update' \
  "$GITHUB_API_URL" > /tmp/github_response.json
LATEST=$(jq -r .tag_name /tmp/github_response.json | sed 's/^v//')
CURRENT=$(jq -r .version "$PLUGIN_JSON_PATH")

if [ "$LATEST" != "$CURRENT" ]; then
  echo "update_available $LATEST $CURRENT"
else
  echo "up_to_date $CURRENT"
fi

echo "== CHECK DONE: $(date)"

"""


def _write_check_script():
    p = pathlib.Path("/tmp/deckywarp_check.sh")
    content = CHECK_SH.replace("__PLUGIN_JSON__", str(_plugin_dir() / "plugin.json"))
    p.write_text(content)
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
        """Запускает обновление плагина через systemd unit (переживает restart Decky)."""
        _force_cleanup_update_flag()

        active = _update_unit_active()
        if active:
            return {"status": "started", "detail": active}

        if _update_log_in_progress():
            return {"status": "started", "detail": "log in progress"}

        try:
            UPD_FLAG.open("x").close()
        except FileExistsError:
            if _update_is_running():
                return {"status": "started", "detail": "already running"}
            _force_cleanup_update_flag()
            if UPD_FLAG.exists():
                return {"status": "error", "detail": "Update already running"}

        script = _write_update_script()
        UPD_LOG.write_text(f"== UPDATE REQUESTED: {time.ctime()} ==\n")

        launch_plan = [
            (UPD_UNIT, ["systemd-run", "--unit", UPD_UNIT, "--service-type=oneshot", "/bin/bash", script]),
            (f"{UPD_UNIT}_sudo", ["sudo", "systemd-run", "--unit", f"{UPD_UNIT}_sudo", "--service-type=oneshot", "/bin/bash", script]),
        ]

        last_error = "systemd-run failed"
        launched_unit = None

        for unit, cmd in launch_plan:
            active = _update_unit_active()
            if active:
                launched_unit = active
                break

            await _run("systemctl", "reset-failed", f"{unit}.service")
            await _run("systemctl", "stop", f"{unit}.service")

            result = await asyncio.to_thread(
                subprocess.run,
                cmd,
                capture_output=True,
                text=True,
                env=_clean_env(),
            )

            await asyncio.sleep(0.5)
            state = _unit_state(unit)

            if result.returncode == 0 or state in ("active", "activating"):
                launched_unit = unit
                break

            if _update_log_in_progress():
                launched_unit = unit
                break

            last_error = (result.stderr or result.stdout or "systemd-run failed").strip()
            log_to_file(f"Update launch failed ({unit}): {last_error}")

        if launched_unit or _update_is_running():
            unit = launched_unit or _update_unit_active() or UPD_UNIT
            state = _unit_state(unit)
            with UPD_LOG.open("a", encoding="utf-8") as f:
                f.write(f"== LAUNCHED via {unit} (state={state}) ==\n")
            log_to_file(f"Update started via {unit}, state={state}")
            return {"status": "started", "detail": state}

        UPD_FLAG.unlink(missing_ok=True)
        with UPD_LOG.open("a", encoding="utf-8") as f:
            f.write(f"ERROR: launch failed: {last_error}\n")
        return {"status": "error", "detail": last_error[:200]}

    async def get_update_log(self):
        return _read_update_log_text()

    async def get_update_progress(self):
        log = _read_update_log_text()
        progress = _parse_update_progress(log)
        progress["log"] = log
        return progress

    async def get_version(self):
        plugin_json = _plugin_dir() / "plugin.json"
        if plugin_json.exists():
            try:
                import json
                data = json.loads(plugin_json.read_text())
                return {"version": data.get("version", "unknown")}
            except Exception:
                pass
        return {"version": "unknown"}

    # ---------- VERSION CHECK -------------------------------------------

    async def check_update(self):
        """Проверить доступность новой версии через отдельный systemd unit."""
        _cleanup_flag(CHK_FLAG, CHK_UNIT)

        if _busy(CHK_FLAG) and _unit_state(CHK_UNIT) in ("active", "activating"):
            parsed = await _wait_for_check_result(timeout=30)
            CHK_FLAG.unlink(missing_ok=True)
            if parsed:
                return parsed
            return {"status": "checking"}

        if _busy(CHK_FLAG):
            CHK_FLAG.unlink(missing_ok=True)

        try:
            CHK_FLAG.open("x").close()
        except FileExistsError:
            parsed = await _wait_for_check_result(timeout=30)
            CHK_FLAG.unlink(missing_ok=True)
            if parsed:
                return parsed
            return {"status": "checking"}

        script = _write_check_script()
        CHK_LOG.write_text(f"== CHECK REQUESTED: {time.ctime()} ==\n")

        await _run("systemctl", "reset-failed", f"{CHK_UNIT}.service")
        await _run("systemctl", "stop", f"{CHK_UNIT}.service")

        cmd = ["systemd-run", "--unit", CHK_UNIT, "--service-type=oneshot", "/bin/bash", script]
        result = await asyncio.to_thread(
            subprocess.run,
            cmd,
            capture_output=True,
            text=True,
            env=_clean_env(),
        )

        if result.returncode != 0:
            sudo_unit = f"{CHK_UNIT}_sudo"
            await _run("systemctl", "reset-failed", f"{sudo_unit}.service")
            await _run("systemctl", "stop", f"{sudo_unit}.service")
            cmd = ["sudo", "systemd-run", "--unit", sudo_unit, "--service-type=oneshot", "/bin/bash", script]
            result = await asyncio.to_thread(
                subprocess.run,
                cmd,
                capture_output=True,
                text=True,
                env=_clean_env(),
            )

        if result.returncode != 0:
            CHK_FLAG.unlink(missing_ok=True)
            detail = (result.stderr or result.stdout or "systemd-run failed").strip()
            return {"status": "error", "detail": detail[:200]}

        parsed = await _wait_for_check_result(timeout=45)
        CHK_FLAG.unlink(missing_ok=True)
        if parsed:
            return parsed
        return {"status": "error", "detail": "check timed out"}

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

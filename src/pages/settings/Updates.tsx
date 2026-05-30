import {
  PanelSection,
  PanelSectionRow,
  ToggleField
} from "decky-frontend-lib";
import { useState, useEffect, useRef } from "react";
import { CustomButtonItem } from "../../components/CustomButtonItem";
import { CustomTextBox } from "../../components/CustomTextBox";
import { UpdateProgressBar, applyUpdateProgressResult } from "../../components/UpdateProgressBar";
import { ServerAPI } from "decky-frontend-lib";

type Props = {
  serverAPI: ServerAPI;
};

const ru = navigator.language?.toLowerCase().startsWith("ru");

const t = (key: string) => {
  const dict: Record<string, string> = {
    logs_placeholder: ru
      ? "Логи проверки обновлений появятся здесь..."
      : "Update check logs will appear here...",
    check_error: ru ? "Ошибка проверки обновлений!" : "Update check error!",
    update_available: ru ? "Доступно обновление до версии" : "Update available: version",
    up_to_date: ru ? "У вас актуальная версия" : "You're on the latest version",
    current_version: ru ? "Текущая версия:" : "Current version:",
    install: ru ? "Установить" : "Install",
    installing: ru ? "Установка..." : "Installing...",
    check: ru ? "Проверить обновления" : "Check for updates",
    checking: ru ? "Проверяем..." : "Checking...",
    ignore: ru ? "Игнорировать" : "Ignore",
    changelog: ru ? "Список изменений" : "Changelog",
    log_label: ru ? "логи" : "logs",
    auto_check: ru ? "Авто-проверка обновлений" : "Auto update check",
    update_found_toast: ru ? "Найдено обновление!" : "Update available!",
    update_ignored: ru ? "🔕 Обновление версии" : "🔕 Update version",
    ignored: ru ? "проигнорировано." : "ignored.",
    error_checking: ru ? "❌ Ошибка при вызове check_update:\n" : "❌ Error during check_update:\n",
    starting_update: ru ? "🚀 Устанавливаем обновление..." : "🚀 Starting update...",
    update_launched: ru ? "✅ Обновление запущено. Плагин скоро перезапустится."
                         : "✅ Update started. Plugin will restart soon.",
    error_during_update: ru ? "❌ Ошибка при установке обновления:\n"
                             : "❌ Error during update:\n",
    update_in_progress: ru
      ? "Обновление выполняется, подождите..."
      : "Update in progress, please wait...",
    update_progress_hint: ru
      ? "Скачивание и установка могут занять до минуты. Не закрывайте меню Quick Access — после завершения Decky Loader перезапустится автоматически."
      : "Download and install may take up to a minute. Keep Quick Access open — Decky Loader will restart automatically when done.",
    update_progress_label: ru ? "Ход обновления" : "Update progress",
    update_toast_start: ru ? "Начинаем обновление до версии" : "Updating to version",
    update_step_fetch: ru ? "Получаем информацию о релизе..." : "Fetching release info...",
    update_step_download: ru ? "Скачиваем обновление..." : "Downloading update...",
    update_step_install: ru ? "Устанавливаем файлы..." : "Installing files...",
    update_step_restart: ru ? "Перезапускаем Decky Loader..." : "Restarting Decky Loader...",
    update_step_done: ru ? "Обновление завершено!" : "Update complete!",
    update_step_error: ru ? "Ошибка обновления" : "Update failed",
    update_launch_failed: ru ? "Не удалось запустить обновление:" : "Failed to start update:"
  };
  return dict[key] || key;
};

const Updates = ({ serverAPI }: Props) => {
  const [autoCheck, setAutoCheck] = useState(false);
  const [log, setLog] = useState(t("logs_placeholder"));
  const [status, setStatus] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [changelog, setChangelog] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(
    localStorage.getItem("update_in_progress") === "true"
  );
  const [isChecking, setIsChecking] = useState(false);
  const [updateHasError, setUpdateHasError] = useState(false);
  const [isUpdateLocked, setIsUpdateLocked] = useState(
    localStorage.getItem("update_in_progress") === "true"
  );

  const IGNORED_KEY = "update_ignored_version";
  const checkingRef = useRef(false);

  const finishUpdateSuccess = async () => {
    localStorage.removeItem("update_in_progress");
    setIsUpdating(false);
    setIsUpdateLocked(false);
    setStatus("up_to_date");
    setLatestVersion(null);
    setChangelog(null);
    localStorage.setItem("update_status", "up_to_date");
    localStorage.removeItem("update_latest");
    localStorage.removeItem("update_changelog");
    try {
      const ver = await (window as any).call("get_version", {});
      if (ver?.version) setCurrentVersion(ver.version);
    } catch (_) {}
    serverAPI.toaster.toast({ title: "DeckyWARP", body: t("update_step_done") });
  };

  const clearUpdateProgress = () => {
    localStorage.removeItem("update_in_progress");
    setIsUpdating(false);
    setIsUpdateLocked(false);
  };

  const applyProgressFromBackend = async (raw?: unknown) => {
    let data = raw;
    if (data === undefined) {
      try {
        data = await (window as any).call("get_update_progress", {});
      } catch (_) {
        try {
          data = await (window as any).call("get_update_log", {});
        } catch (_) {
          data = null;
        }
      }
    }

    const progress = applyUpdateProgressResult(data as any);
    if (!progress) return null;

    setUpdateHasError(progress.failed);
    if (progress.log) setLog(progress.log);
    return progress;
  };

  useEffect(() => {
    const storedDebug = localStorage.getItem("debug_mode");
    if (storedDebug !== null) setDebugMode(storedDebug === "true");

    const storedAutoCheck = localStorage.getItem("auto_check") === "true";
    setAutoCheck(storedAutoCheck);

    const storedStatus = localStorage.getItem("update_status");
    const storedLatest = localStorage.getItem("update_latest");
    const storedCurrent = localStorage.getItem("update_current");
    const storedChangelog = localStorage.getItem("update_changelog");
    const inProgress = localStorage.getItem("update_in_progress") === "true";

    if (storedStatus) setStatus(storedStatus);
    if (storedLatest) setLatestVersion(storedLatest);
    if (storedCurrent) setCurrentVersion(storedCurrent);
    if (storedStatus === "update_available" && storedChangelog) {
      setChangelog(storedChangelog);
    }

    if (inProgress) {
      setIsUpdating(true);
      setIsUpdateLocked(true);
    }

    (async () => {
      try {
        const result = await (window as any).call("get_version", {});
        setCurrentVersion(result.version);

        const storedLatestVer = localStorage.getItem("update_latest");
        if (
          storedStatus === "update_available" &&
          storedLatestVer &&
          result.version === storedLatestVer &&
          !inProgress
        ) {
          setStatus("up_to_date");
          setLatestVersion(null);
          setChangelog(null);
          localStorage.setItem("update_status", "up_to_date");
          localStorage.removeItem("update_latest");
          localStorage.removeItem("update_changelog");
        }
      } catch (_) {
        setCurrentVersion(null);
      }

      if (inProgress) {
        try {
          const progress = await applyProgressFromBackend();
          if (progress?.done) {
            await finishUpdateSuccess();
          } else if (progress?.failed) {
            clearUpdateProgress();
          }
        } catch (_) {}
      }

      if (storedAutoCheck && !inProgress) onCheckUpdates();
    })();
  }, []);

  useEffect(() => {
    if (!isUpdating && !isUpdateLocked) return;

    const pollUpdateLog = async () => {
      try {
        const progress = await applyProgressFromBackend();
        if (!progress) return;

        if (progress.done) {
          await finishUpdateSuccess();
        } else if (progress.failed) {
          clearUpdateProgress();
          serverAPI.toaster.toast({ title: "DeckyWARP", body: t("update_step_error") });
        }
      } catch (_) {}
    };

    pollUpdateLog();
    const interval = setInterval(pollUpdateLog, 1000);
    return () => clearInterval(interval);
  }, [isUpdating, isUpdateLocked, serverAPI]);

  const handleAutoCheckToggle = (value: boolean) => {
    setAutoCheck(value);
    localStorage.setItem("auto_check", value.toString());
    if (value) onCheckUpdates();
  };

  const resetUpdateState = () => {
    localStorage.setItem(IGNORED_KEY, latestVersion || "");
    ["update_status", "update_latest", "update_changelog", "update_in_progress"].forEach(k =>
      localStorage.removeItem(k)
    );
    setStatus(null);
    setLatestVersion(null);
    setChangelog(null);
    setIsUpdating(false);
    setIsUpdateLocked(false);
    setAutoCheck(false);
    localStorage.setItem("auto_check", "false");
    setLog(prev => prev + `\n${t("update_ignored")} ${latestVersion} ${t("ignored")}`);
  };

  const onCheckUpdates = async () => {
    if (checkingRef.current || isChecking) return;
    checkingRef.current = true;
    setIsChecking(true);
    setLog(prev => prev + `\n⏳ ${t("check")}...`);
    try {
      const result = await (window as any).call("check_update", {});

      if (result.status === "checking") {
        setLog(prev => prev + `\n⏳ ${t("checking")}`);
        return;
      }

      const ignored = localStorage.getItem(IGNORED_KEY);
      if (result.status === "update_available" && result.latest === ignored) {
        setLog(prev => prev + `\n🔕 ${t("update_available")} ${result.latest} ${t("ignored")}`);
        setStatus("up_to_date");
        setLatestVersion(null);
        setChangelog(null);
        localStorage.setItem("update_status", "up_to_date");
        return;
      }

      setStatus(result.status);
      setLatestVersion(result.latest);
      setCurrentVersion(result.current);

      if (result.status === "update_available" && result.changelog) {
        setChangelog(result.changelog);
        serverAPI.toaster.toast({ title: "DeckyWARP", body: t("update_found_toast") });
      } else {
        setChangelog(null);
      }

      setLog(prev => prev + "\n" + JSON.stringify(result, null, 2));

      localStorage.setItem("update_status", result.status);
      localStorage.setItem("update_latest", result.latest);
      localStorage.setItem("update_current", result.current);
      localStorage.setItem("update_changelog", result.changelog || "");

      if (result.status !== "update_available") {
        if (localStorage.getItem("update_in_progress") !== "true") {
          setIsUpdateLocked(false);
        }
      }
    } catch (e) {
      setStatus("error");
      setLog(prev => prev + `\n${t("error_checking")}` + e);
      setChangelog(null);
      localStorage.setItem("update_status", "error");
      localStorage.setItem("update_changelog", "");
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
    }
  };

  const onUpdate = async () => {
    setIsUpdating(true);
    setIsUpdateLocked(true);
    setUpdateHasError(false);
    localStorage.setItem("update_in_progress", "true");
    setLog(t("starting_update"));

    serverAPI.toaster.toast({
      title: "DeckyWARP",
      body: `${t("update_toast_start")} ${latestVersion || ""}...`
    });

    try {
      const result = await (window as any).call("update_plugin", {});

      if (result?.status === "error") {
        let progress = null;
        try {
          progress = await applyProgressFromBackend();
        } catch (_) {}

        if (progress && !progress.failed && !progress.done) {
          return;
        }

        setUpdateHasError(true);
        setLog(prev => `${prev}\n${t("update_launch_failed")} ${result.detail || ""}`);
        setIsUpdating(false);
        setIsUpdateLocked(false);
        localStorage.removeItem("update_in_progress");
        serverAPI.toaster.toast({ title: "DeckyWARP", body: t("update_step_error") });
        return;
      }

      await applyProgressFromBackend();
    } catch (e) {
      setUpdateHasError(true);
      setLog(prev => `${prev}\n${t("error_during_update")}${e}`);
      setIsUpdating(false);
      setIsUpdateLocked(false);
      localStorage.removeItem("update_in_progress");
    }
  };

  const renderStatus = () => {
    if (isUpdating || isUpdateLocked) return t("installing");
    if (status === "error") return t("check_error");
    if (status === "update_available" && latestVersion)
      return `${t("update_available")} ${latestVersion}!`;
    if (status === "up_to_date" && currentVersion)
      return `${t("up_to_date")} (${currentVersion})!`;
    if (currentVersion) return `${t("current_version")} ${currentVersion}`;
    return "";
  };

  const renderUpdateButton = () => {
    if (status === "update_available") {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <CustomButtonItem
            onClick={onUpdate}
            disabled={isUpdating || isUpdateLocked}
          >
            {isUpdating ? t("installing") : t("install")}
          </CustomButtonItem>
        </div>
      );
    } else {
      return (
        <CustomButtonItem onClick={onCheckUpdates} disabled={isChecking}>
          {isChecking ? t("checking") : t("check")}
        </CustomButtonItem>
      );
    }
  };

  return (
    <PanelSection>
      <PanelSectionRow>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          {renderUpdateButton()}
          <div
            style={{
              marginLeft: "auto",
              fontSize: "14px",
              color: "white",
              opacity: 0.7,
              paddingLeft: "16px"
            }}
          >
            {renderStatus()}
          </div>
        </div>
      </PanelSectionRow>

      {status === "update_available" && changelog && (
        <PanelSectionRow>
          <CustomTextBox label={t("changelog")} content={changelog} />
        </PanelSectionRow>
      )}

      {status === "update_available" && (
        <PanelSectionRow>
          <CustomButtonItem
            onClick={resetUpdateState}
            disabled={isUpdating || isUpdateLocked}
          >
            {t("ignore")}
          </CustomButtonItem>
        </PanelSectionRow>
      )}

      {(isUpdating || isUpdateLocked) && (
        <PanelSectionRow>
          <UpdateProgressBar indeterminate error={updateHasError} />
        </PanelSectionRow>
      )}

      {isChecking && (
        <PanelSectionRow>
          <UpdateProgressBar indeterminate />
        </PanelSectionRow>
      )}

      {(isUpdating || isUpdateLocked) && debugMode && (
        <PanelSectionRow>
          <CustomTextBox
            label={t("update_progress_label")}
            content={log}
          />
        </PanelSectionRow>
      )}

      {debugMode && !(isUpdating || isUpdateLocked) && (
        <PanelSectionRow>
          <CustomTextBox label={t("log_label")} content={log} />
        </PanelSectionRow>
      )}

      <ToggleField
        label={t("auto_check")}
        checked={autoCheck}
        onChange={handleAutoCheckToggle}
      />
    </PanelSection>
  );
};

export default Updates;

(function (deckyFrontendLib, React) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

    var DefaultContext = {
        color: undefined,
        size: undefined,
        className: undefined,
        style: undefined,
        attr: undefined
    };
    var IconContext = React__default["default"].createContext && React__default["default"].createContext(DefaultContext);

    var __assign = window && window.__assign || function () {
        __assign = Object.assign || function (t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    var __rest = window && window.__rest || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    };
    function Tree2Element(tree) {
        return tree && tree.map(function (node, i) {
            return React__default["default"].createElement(node.tag, __assign({
                key: i
            }, node.attr), Tree2Element(node.child));
        });
    }
    function GenIcon(data) {
        // eslint-disable-next-line react/display-name
        return function (props) {
            return React__default["default"].createElement(IconBase, __assign({
                attr: __assign({}, data.attr)
            }, props), Tree2Element(data.child));
        };
    }
    function IconBase(props) {
        var elem = function (conf) {
            var attr = props.attr,
            size = props.size,
            title = props.title,
            svgProps = __rest(props, ["attr", "size", "title"]);
            var computedSize = size || conf.size || "1em";
            var className;
            if (conf.className) className = conf.className;
            if (props.className) className = (className ? className + " " : "") + props.className;
            return React__default["default"].createElement("svg", __assign({
                stroke: "currentColor",
                fill: "currentColor",
                strokeWidth: "0"
            }, conf.attr, attr, svgProps, {
                className: className,
                style: __assign(__assign({
                    color: props.color || conf.color
                }, conf.style), props.style),
                height: computedSize,
                width: computedSize,
                xmlns: "http://www.w3.org/2000/svg"
            }), title && React__default["default"].createElement("title", null, title), props.children);
        };
        return IconContext !== undefined ? React__default["default"].createElement(IconContext.Consumer, null, function (conf) {
            return elem(conf);
        }) : elem(DefaultContext);
    }

    // THIS FILE IS AUTO GENERATED
    function FaCloud (props) {
        return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4z"}}]})(props);
    }function FaDownload (props) {
        return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"}}]})(props);
    }function FaHeart (props) {
        return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"}}]})(props);
    }

    // THIS FILE IS AUTO GENERATED
    function BsGearFill (props) {
        return GenIcon({"tag":"svg","attr":{"fill":"currentColor","viewBox":"0 0 16 16"},"child":[{"tag":"path","attr":{"d":"M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"}}]})(props);
    }

    const CustomButtonItem = ({ onClick, children, disabled = false, }) => {
        const baseStyle = {
            backgroundColor: disabled ? "rgb(30, 34, 36)" : "rgb(43, 51, 55)",
 color: disabled ? "rgba(255, 255, 255, 0.4)" : "white",
 fontSize: "16px",
 fontWeight: "normal",
 padding: "10px 28px",
 cursor: disabled ? "default" : "pointer",
 userSelect: "none",
 borderRadius: "2px",
 display: "inline-block",
 lineHeight: 1.25,
 transition: "background-color 0.2s, color 0.2s",
 pointerEvents: disabled ? "none" : "auto",
        };
        const handleMouseEnter = (e) => {
            if (!disabled)
                e.currentTarget.style.backgroundColor = "rgb(57, 65, 69)";
        };
        const handleMouseLeave = (e) => {
            if (!disabled) {
                e.currentTarget.style.backgroundColor = "rgb(43, 51, 55)";
                e.currentTarget.style.color = "white";
            }
        };
        const handleMouseDown = (e) => {
            if (!disabled) {
                e.currentTarget.style.backgroundColor = "rgb(108, 113, 116)";
                e.currentTarget.style.color = "rgb(43, 51, 55)";
            }
        };
        const handleMouseUp = (e) => {
            if (!disabled) {
                e.currentTarget.style.backgroundColor = "rgb(57, 65, 69)";
                e.currentTarget.style.color = "white";
            }
        };
        return (window.SP_REACT.createElement(deckyFrontendLib.Focusable, { onActivate: !disabled ? onClick : undefined },
                                              window.SP_REACT.createElement("div", { onClick: !disabled ? onClick : undefined, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onMouseDown: handleMouseDown, onMouseUp: handleMouseUp, style: baseStyle }, children)));
    };

    const ru$3 = navigator.language?.toLowerCase().startsWith("ru");
    const PluginSettings = () => {
        const [debugMode, setDebugMode] = React.useState(false);
        const [isClearing, setIsClearing] = React.useState(false);
        const [clearMessage, setClearMessage] = React.useState(null);
        const logPaths = [
            "/tmp/deckywarp.log",
            "/tmp/deckywarp_update.log",
            "/tmp/warp_install.log"
        ];
        const storageKeys = [
            {
                key: "update_status",
                commentRu: "статус последней проверки",
                commentEn: "last update check status"
            },
            {
                key: "update_latest",
                commentRu: "доступная версия",
                commentEn: "available version"
            },
            {
                key: "update_changelog",
                commentRu: "текст изменений",
                commentEn: "changelog text"
            },
            {
                key: "update_in_progress",
                commentRu: "флаг, что идёт обновление",
                commentEn: "flag indicating update is in progress"
            },
            {
                key: "update_ignored_version",
                commentRu: "версия, которую нужно игнорировать",
                commentEn: "version to ignore"
            }
        ];
        React.useEffect(() => {
            const stored = localStorage.getItem("debug_mode");
            if (stored !== null) {
                setDebugMode(stored === "true");
            }
        }, []);
        const handleDebugToggle = (value) => {
            setDebugMode(value);
            localStorage.setItem("debug_mode", value.toString());
        };
        const handleClearLogs = async () => {
            setIsClearing(true);
            setClearMessage(null);
            try {
                await window.call("clear_logs", {});
                setClearMessage(ru$3 ? "✅ Логи очищены" : "✅ Logs cleared");
            }
            catch (e) {
                setClearMessage(ru$3 ? "❌ Ошибка при очистке логов" : "❌ Error while clearing logs");
            }
            finally {
                setIsClearing(false);
            }
        };
        const handleClearKey = (key) => {
            localStorage.removeItem(key);
        };
        return (window.SP_REACT.createElement(deckyFrontendLib.PanelSection, null,
                                              window.SP_REACT.createElement(deckyFrontendLib.ToggleField, { label: ru$3 ? "Режим отладки" : "Debug mode", checked: debugMode, onChange: handleDebugToggle }),
                                              debugMode && (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
                                                                                          window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                                        window.SP_REACT.createElement("div", { style: { fontWeight: "bold", marginBottom: "4px" } }, ru$3 ? "Логи" : "Logs")),
                                                                                          window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                                        window.SP_REACT.createElement("div", { style: { display: "flex", alignItems: "center", width: "100%" } },
                                                                                                                                                      window.SP_REACT.createElement(CustomButtonItem, { onClick: handleClearLogs, disabled: isClearing }, isClearing
                                                                                                                                                      ? ru$3 ? "Очищаем..." : "Clearing..."
                                                                                                                                                      : ru$3 ? "Очистить логи" : "Clear logs"),
                                                                                                                                                      clearMessage && (window.SP_REACT.createElement("div", { style: {
                                                                                                                                                          marginLeft: "auto",
                                                                                                                                                          color: "#aaa",
                                                                                                                                                          fontSize: "13px",
                                                                                                                                                          whiteSpace: "nowrap"
                                                                                                                                                      } }, clearMessage)))),
                                                                                          window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                                        window.SP_REACT.createElement("div", { style: { color: "#aaa", fontSize: "13px", padding: "4px 0" } },
                                                                                                                                                      ru$3 ? "Логи находятся по пути:" : "Log file locations:",
                                                                                                                                                      window.SP_REACT.createElement("br", null),
                                                                                                                                                      logPaths.map(p => (window.SP_REACT.createElement("div", { key: p }, p))))),
                                                                                          window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                                        window.SP_REACT.createElement("div", { style: { fontWeight: "bold", marginTop: "8px" } }, ru$3 ? "Удалить ключи в LocalStorage" : "Delete LocalStorage keys")),
                                                                                          storageKeys.map(({ key, commentRu, commentEn }) => (window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, { key: key },
                                                                                                                                                                            window.SP_REACT.createElement("div", { style: { display: "flex", alignItems: "center", width: "100%" } },
                                                                                                                                                                                                          window.SP_REACT.createElement(CustomButtonItem, { onClick: () => handleClearKey(key) }, ru$3 ? `Удалить ключ ${key}` : `Delete key ${key}`),
                                                                                                                                                                                                          window.SP_REACT.createElement("div", { style: {
                                                                                                                                                                                                              marginLeft: "auto",
                                                                                                                                                                                                              color: "#aaa",
                                                                                                                                                                                                              fontSize: "13px",
                                                                                                                                                                                                              whiteSpace: "nowrap"
                                                                                                                                                                                                          } }, ru$3 ? commentRu : commentEn)))))))));
    };

    const CustomTextBox = ({ label, content, }) => (window.SP_REACT.createElement("div", { style: { width: "100%" } },
                                                                                  window.SP_REACT.createElement("div", { style: {
                                                                                      fontSize: "12px",
                                                                                      color: "rgba(255, 255, 255, 0.5)",
                                                                                                                marginBottom: "4px",
                                                                                  } }, label),
                                                                                  window.SP_REACT.createElement("div", { style: {
                                                                                      whiteSpace: "pre-wrap",
                                                                                      backgroundColor: "rgb(30, 34, 37)",
                                                                                                                color: "rgb(184, 188, 192)",
                                                                                                                padding: "10px",
                                                                                                                borderRadius: "4px",
                                                                                  } }, content)));

    const ru$2 = navigator.language?.toLowerCase().startsWith("ru");
    const t$1 = (key) => {
        const dict = {
            logs_placeholder: ru$2
            ? "Логи проверки обновлений появятся здесь..."
            : "Update check logs will appear here...",
            check_error: ru$2 ? "Ошибка проверки обновлений!" : "Update check error!",
            update_available: ru$2 ? "Доступно обновление до версии" : "Update available: version",
            up_to_date: ru$2 ? "У вас актуальная версия" : "You're on the latest version",
            current_version: ru$2 ? "Текущая версия:" : "Current version:",
            install: ru$2 ? "Установить" : "Install",
            installing: ru$2 ? "Установка..." : "Installing...",
            check: ru$2 ? "Проверить обновления" : "Check for updates",
            checking: ru$2 ? "Проверяем..." : "Checking...",
            ignore: ru$2 ? "Игнорировать" : "Ignore",
            changelog: ru$2 ? "Список изменений" : "Changelog",
            log_label: ru$2 ? "логи" : "logs",
            auto_check: ru$2 ? "Авто-проверка обновлений" : "Auto update check",
            update_found_toast: ru$2 ? "Найдено обновление!" : "Update available!",
            update_ignored: ru$2 ? "🔕 Обновление версии" : "🔕 Update version",
            ignored: ru$2 ? "проигнорировано." : "ignored.",
            error_checking: ru$2 ? "❌ Ошибка при вызове check_update:\n" : "❌ Error during check_update:\n",
            starting_update: ru$2 ? "🚀 Устанавливаем обновление..." : "🚀 Starting update...",
            update_launched: ru$2 ? "✅ Обновление запущено. Плагин скоро перезапустится."
            : "✅ Update started. Plugin will restart soon.",
            error_during_update: ru$2 ? "❌ Ошибка при установке обновления:\n"
            : "❌ Error during update:\n"
        };
        return dict[key] || key;
    };
    const Updates = ({ serverAPI }) => {
        const [autoCheck, setAutoCheck] = React.useState(false);
        const [log, setLog] = React.useState(t$1("logs_placeholder"));
        const [status, setStatus] = React.useState(null);
        const [currentVersion, setCurrentVersion] = React.useState(null);
        const [latestVersion, setLatestVersion] = React.useState(null);
        const [changelog, setChangelog] = React.useState(null);
        const [debugMode, setDebugMode] = React.useState(false);
        const [isUpdating, setIsUpdating] = React.useState(false);
        const [isChecking, setIsChecking] = React.useState(false);
        const [isUpdateLocked, setIsUpdateLocked] = React.useState(localStorage.getItem("update_in_progress") === "true");
        const IGNORED_KEY = "update_ignored_version";
        React.useEffect(() => {
            localStorage.removeItem("update_in_progress");
            setIsUpdateLocked(false);
            const storedDebug = localStorage.getItem("debug_mode");
            if (storedDebug !== null)
                setDebugMode(storedDebug === "true");
            const storedAutoCheck = localStorage.getItem("auto_check") === "true";
            setAutoCheck(storedAutoCheck);
            const storedStatus = localStorage.getItem("update_status");
            const storedLatest = localStorage.getItem("update_latest");
            const storedCurrent = localStorage.getItem("update_current");
            const storedChangelog = localStorage.getItem("update_changelog");
            if (storedStatus)
                setStatus(storedStatus);
            if (storedLatest)
                setLatestVersion(storedLatest);
            if (storedCurrent)
                setCurrentVersion(storedCurrent);
            if (storedStatus === "update_available" && storedChangelog) {
                setChangelog(storedChangelog);
            }
            (async () => {
                try {
                    const result = await window.call("get_version", {});
                    setCurrentVersion(result.version);
                }
                catch (_) {
                    setCurrentVersion(null);
                }
                const inProgress = localStorage.getItem("update_in_progress") === "true";
                if (!inProgress || storedStatus !== "update_available") {
                    localStorage.removeItem("update_in_progress");
                    setIsUpdateLocked(false);
                }
                if (storedAutoCheck)
                    onCheckUpdates();
            })();
        }, []);
        React.useEffect(() => {
            let interval = null;
            if (debugMode || isUpdating || isUpdateLocked) {
                interval = setInterval(async () => {
                    try {
                        const result = await window.call("get_update_log", {});
                        if (result)
                            setLog(prev => prev + "\n" + result);
                    }
                    catch (_) { }
                }, 1000);
            }
            return () => clearInterval(interval);
        }, [debugMode, isUpdating, isUpdateLocked]);
        const handleAutoCheckToggle = (value) => {
            setAutoCheck(value);
            localStorage.setItem("auto_check", value.toString());
            if (value)
                onCheckUpdates();
        };
        const resetUpdateState = () => {
            localStorage.setItem(IGNORED_KEY, latestVersion || "");
            ["update_status", "update_latest", "update_changelog", "update_in_progress"].forEach(k => localStorage.removeItem(k));
            setStatus(null);
            setLatestVersion(null);
            setChangelog(null);
            setIsUpdateLocked(false);
            setAutoCheck(false);
            localStorage.setItem("auto_check", "false");
            setLog(prev => prev + `\n${t$1("update_ignored")} ${latestVersion} ${t$1("ignored")}`);
        };
        const onCheckUpdates = async () => {
            setIsChecking(true);
            setLog(prev => prev + `\n⏳ ${t$1("check")}...`);
            try {
                const result = await window.call("check_update", {});
                const ignored = localStorage.getItem(IGNORED_KEY);
                if (result.status === "update_available" && result.latest === ignored) {
                    setLog(prev => prev + `\n🔕 ${t$1("update_available")} ${result.latest} ${t$1("ignored")}`);
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
                    serverAPI.toaster.toast({ title: "DeckyWARP", body: t$1("update_found_toast") });
                }
                else {
                    setChangelog(null);
                }
                setLog(prev => prev + "\n" + JSON.stringify(result, null, 2));
                localStorage.setItem("update_status", result.status);
                localStorage.setItem("update_latest", result.latest);
                localStorage.setItem("update_current", result.current);
                localStorage.setItem("update_changelog", result.changelog || "");
                if (result.status !== "update_available") {
                    localStorage.removeItem("update_in_progress");
                    setIsUpdateLocked(false);
                }
            }
            catch (e) {
                setStatus("error");
                setLog(prev => prev + `\n${t$1("error_checking")}` + e);
                setChangelog(null);
                localStorage.setItem("update_status", "error");
                localStorage.setItem("update_changelog", "");
            }
            finally {
                setIsChecking(false);
            }
        };
        const onUpdate = async () => {
            setIsUpdating(true);
            setIsUpdateLocked(true);
            localStorage.setItem("update_in_progress", "true");
            setLog(prev => prev + `\n${t$1("starting_update")}`);
            try {
                await window.call("update_plugin", {});
                setLog(prev => prev + `\n${t$1("update_launched")}`);
            }
            catch (e) {
                setLog(prev => prev + `\n${t$1("error_during_update")}` + e);
            }
            finally {
                setIsUpdating(false);
                localStorage.removeItem("update_in_progress");
                setIsUpdateLocked(false);
            }
        };
        const renderStatus = () => {
            if (status === "error")
                return t$1("check_error");
            if (status === "update_available" && latestVersion)
                return `${t$1("update_available")} ${latestVersion}!`;
            if (status === "up_to_date" && currentVersion)
                return `${t$1("up_to_date")} (${currentVersion})!`;
            if (currentVersion)
                return `${t$1("current_version")} ${currentVersion}`;
            return "";
        };
        const renderUpdateButton = () => {
            if (status === "update_available") {
                return (window.SP_REACT.createElement("div", { style: { display: "flex", gap: "8px" } },
                                                      window.SP_REACT.createElement(CustomButtonItem, { onClick: onUpdate, disabled: isUpdating || isUpdateLocked }, isUpdating ? t$1("installing") : t$1("install"))));
            }
            else {
                return (window.SP_REACT.createElement(CustomButtonItem, { onClick: onCheckUpdates, disabled: isChecking }, isChecking ? t$1("checking") : t$1("check")));
            }
        };
        return (window.SP_REACT.createElement(deckyFrontendLib.PanelSection, null,
                                              window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                            window.SP_REACT.createElement("div", { style: { display: "flex", alignItems: "center", width: "100%" } },
                                                                                                          renderUpdateButton(),
                                                                                                          window.SP_REACT.createElement("div", { style: {
                                                                                                              marginLeft: "auto",
                                                                                                              fontSize: "14px",
                                                                                                              color: "white",
                                                                                                              opacity: 0.7,
                                                                                                              paddingLeft: "16px"
                                                                                                          } }, renderStatus()))),
                                              status === "update_available" && changelog && (window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                                           window.SP_REACT.createElement(CustomTextBox, { label: t$1("changelog"), content: changelog }))),
                                              status === "update_available" && (window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement(CustomButtonItem, { onClick: resetUpdateState, disabled: isUpdating }, t$1("ignore")))),
                                              debugMode && (window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                          window.SP_REACT.createElement(CustomTextBox, { label: t$1("log_label"), content: log }))),
                                              window.SP_REACT.createElement(deckyFrontendLib.ToggleField, { label: t$1("auto_check"), checked: autoCheck, onChange: handleAutoCheckToggle })));
    };


    const open = (url) => {
        try {
            window.open(url, "_blank");
        }
        catch (e) {
            console.error("Failed to open URL:", url, e);
        }
    };
    const ru$1 = navigator.language?.toLowerCase().startsWith("ru");
    const Credits = () => (window.SP_REACT.createElement(deckyFrontendLib.PanelSection, null,
                                                         window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                       window.SP_REACT.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px", width: "100%" } },
                                                                                                                     // Благодарность death_nick
                                                                                                                     window.SP_REACT.createElement("div", { style: { fontSize: "14px", lineHeight: "1.5" } },
                                                                                                                                                   window.SP_REACT.createElement("strong", { style: { color: "#71c6ff" } }, ru ? "Выражаю благодарность death_nick" : "Special thanks to death_nick"),
                                                                                                                                                   ru ? " за то, что он создал этот плагин и проделал много работы с ним!" : " for creating this plugin and doing a lot of work on it!",
                                                                                                                                                   window.SP_REACT.createElement("br", null),
                                                                                                                                                   ru ? "Данный плагин является продолжением его работы." : "This plugin is a continuation of his work."
                                                                                                                     ),

                                                                                                                     // Разделитель
                                                                                                                     window.SP_REACT.createElement("div", { style: {
                                                                                                                         height: "1px",
                                                                                                                         backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                                                                                                                   margin: "8px 0"
                                                                                                                     } }),

                                                                                                                     // Благодарность проекту
                                                                                                                     window.SP_REACT.createElement("div", { style: { textAlign: "center", width: "100%" } },
                                                                                                                                                   window.SP_REACT.createElement("strong", null, ru ? "Вам" : "You"),
                                                                                                                                                   " \u2014",
                                                                                                                                                   " ",
                                                                                                                                                   ru ? "за использование" : "for using",
                                                                                                                                                   " ",
                                                                                                                                                   window.SP_REACT.createElement("strong", null, "DeckyWARP"),
                                                                                                                                                   "!"
                                                                                                                     ),

                                                                                                                     // Кнопка GitHub
                                                                                                                     window.SP_REACT.createElement(deckyFrontendLib.ButtonItem, {
                                                                                                                         layout: "below",
                                                                                                                         onClick: () => open("https://github.com/mashakulina/DeckyWARP")
                                                                                                                     },
                                                                                                                     window.SP_REACT.createElement("span", { style: { color: "#71c6ff" } },
                                                                                                                                                   ru ? "Ссылка на Github проекта" : "Project GitHub Link"
                                                                                                                     )
                                                                                                                     )
                                                                                       )
                                                         ),

                                                         window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                       window.SP_REACT.createElement("div", { style: { fontSize: "12px", color: "#aaa", width: "100%", textAlign: "center" } },
                                                                                                                     window.SP_REACT.createElement("i", null, ru
                                                                                                                     ? "Оригинальный плагин разработан death_nick совместно с ChatGPT. Данный плагин доработан Mels Kappi. Приятного пользования!"
                                                                                                                     : "The original plugin was developed by death_nick in collaboration with ChatGPT. This plugin has been enhanced by Mels Kappi. Enjoy using it!"
                                                                                                                     )
                                                                                       )
                                                         )
    ));

    const ru = navigator.language?.toLowerCase().startsWith("ru");
    const t = (key) => {
        const dict = {
            updates: ru ? "Обновление" : "Updates",
            general: ru ? "Настройки" : "Settings",
            credits: ru ? "Благодарности" : "Credits",
        };
        return dict[key] || key;
    };
    const SettingsPageRouter = ({ serverAPI }) => (window.SP_REACT.createElement(deckyFrontendLib.SidebarNavigation, { pages: [
        {
            title: t("updates"),
                                                                                 icon: window.SP_REACT.createElement(FaDownload, null),
                                                                                 route: "/deckywarp/settings/updates",
                                                                                 content: window.SP_REACT.createElement(Updates, { serverAPI: serverAPI }),
        },
        {
            title: t("general"),
                                                                                 icon: window.SP_REACT.createElement(BsGearFill, null),
                                                                                 route: "/deckywarp/settings/general",
                                                                                 content: window.SP_REACT.createElement(PluginSettings, { serverAPI: serverAPI }),
        },
        {
            title: t("credits"),
                                                                                 icon: window.SP_REACT.createElement(FaHeart, null),
                                                                                 route: "/deckywarp/settings/credits",
                                                                                 content: window.SP_REACT.createElement(Credits, { serverAPI: serverAPI }),
        },
    ] }));

    let api;
    const setServerAPI = (s) => (api = s);
    async function call(name, params) {
        const r = await api.callPluginMethod(name, params);
        if (r.success)
            return r.result;
        throw r.result;
    }
    const get_state = () => call("get_state", {});
    const toggle_warp = () => call("toggle_warp", {});
    const install_warp = () => call("install_warp", {});
    const get_install_log = () => call("get_install_log", {});
    const check_update_flag = () => call("check_update_flag", {});
    const set_update_flag = (value) => call("set_update_flag", { value: value ? "1" : "0" });

    // ДОБАВЛЕННЫЕ ФУНКЦИИ ДЛЯ РЕЖИМОВ
    const get_current_mode = () => call("get_current_mode", {});
    const set_warp_mode = (mode) => call("set_warp_mode", { mode });

    const txt = (ru, s) => {
        const ruT = {
            connected: "Статус WARP: Подключено",
            disconnected: "Статус WARP: Отключено",
            error: "Статус WARP: Неизвестно",
            missing: "WARP не установлен",
            installing: "Установка WARP…",
        };
        const enT = {
            connected: "WARP status: connected",
            disconnected: "WARP status: disconnected",
            error: "WARP status: unknown",
            missing: "WARP is not installed",
            installing: "Installing WARP…",
        };
        return (ru ? ruT : enT)[s];
    };

    const Content = () => {
        React.useEffect(() => {
            const observer = new MutationObserver(() => {
                const topBar = document.querySelector('[class*="TopBar"], [class*="topBar"]');
                if (!topBar || topBar.querySelector(".deckywarp-top-icon"))
                    return;
                const icon = document.createElement("div");
                icon.className = "deckywarp-top-icon";
                icon.style.width = "24px";
                icon.style.height = "24px";
                icon.style.display = "flex";
                icon.style.alignItems = "center";
                icon.style.justifyContent = "center";
                icon.style.marginLeft = "6px";
                icon.style.color = "white";
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("fill", "currentColor");
                svg.setAttribute("viewBox", "0 0 640 512");
                svg.setAttribute("height", "18");
                svg.setAttribute("width", "18");
                svg.innerHTML = '<path d="M537.6 226.6c-28.7-82.4-111-138.6-200.3-138.6-63.6 0-122.8 29.5-161.2 79.4-72.6 6.3-128.1 67.1-128.1 141.3 0 79.5 64.5 144 144 144H496c70.7 0 128-57.3 128-128 0-63.3-45.9-116-104.4-129.1z"/>';
                icon.appendChild(svg);
                topBar.appendChild(icon);
                console.log("[DeckyWARP] FaCloud icon appended (fallback mode)");
                observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return () => observer.disconnect();
        }, []);

        const [st, setSt] = React.useState("error");
        const [log, setLog] = React.useState("");
        const [currentMode, setCurrentMode] = React.useState("warp+doh");
        const [isChangingMode, setIsChangingMode] = React.useState(false);
        const [modeText, setModeText] = React.useState("");
        const [debugInfo, setDebugInfo] = React.useState("");

        const ru = navigator.language?.toLowerCase().startsWith("ru");

        const refreshState = async () => {
            try {
                const newState = await get_state();
                setSt(newState);
            } catch (error) {
                console.error("Error refreshing state:", error);
                setSt("error");
            }
        };

        const refreshLog = async () => {
            try {
                const newLog = await get_install_log();
                setLog(newLog);
            } catch (error) {
                console.error("Error refreshing log:", error);
            }
        };

        const loadCurrentMode = async () => {
            try {
                console.log("[DeckyWARP] Loading current mode...");
                const mode = await window.call("get_current_mode", {});
                console.log("[DeckyWARP] Got mode from backend:", mode);

                if (mode && mode !== "unknown") {
                    setCurrentMode(mode);
                    updateModeText(mode);
                    setDebugInfo(`Mode loaded: ${mode}`);
                } else {
                    setCurrentMode("warp+doh");
                    updateModeText("warp+doh");
                    setDebugInfo(`Mode default: ${mode || "unknown"}`);
                }
            } catch (error) {
                console.error("[DeckyWARP] Failed to load current mode:", error);
                setCurrentMode("warp+doh");
                updateModeText("warp+doh");
                setDebugInfo(`Error: ${error.message || error}`);
            }
        };

        const updateModeText = (mode) => {
            const modeMap = {
                'warp': ru ? 'Только Warp' : 'Warp only',
                'doh': ru ? 'DNS через HTTPS' : 'DNS over HTTPS',
                'warp+doh': ru ? 'Warp + DNS через HTTPS' : 'Warp + DNS over HTTPS'
            };
            setModeText(modeMap[mode] || mode);
        };

        const handleModeChange = async (newMode) => {
            if (isChangingMode || currentMode === newMode) return;

            console.log(`[DeckyWARP] Changing mode from ${currentMode} to ${newMode}`);
            setIsChangingMode(true);
            setDebugInfo(`Changing to: ${newMode}...`);

            try {
                const result = await window.call("set_warp_mode", { mode: newMode });
                console.log("[DeckyWARP] set_warp_mode result:", result);

                if (result && (result.status === "success" || result.status === "already_set")) {
                    setCurrentMode(newMode);
                    updateModeText(newMode);
                    setDebugInfo(`Mode changed to: ${newMode}`);
                } else {
                    setDebugInfo(`Failed: ${JSON.stringify(result)}`);
                }
            } catch (error) {
                console.error("[DeckyWARP] Failed to set mode:", error);
                setDebugInfo(`Error: ${error.message || error}`);
            } finally {
                setIsChangingMode(false);
            }
        };

        React.useEffect(() => {
            refreshState();
            loadCurrentMode();

            const id = setInterval(() => {
                refreshState();
                refreshLog();
            }, 3000);

            return () => clearInterval(id);
        }, []);

        // Создаем options массив для Dropdown
        const modeOptions = [
            { label: ru ? "Только Warp" : "Warp only", value: "warp" },
            { label: ru ? "DNS через HTTPS" : "DNS over HTTPS", value: "doh" },
            { label: ru ? "Warp + DNS через HTTPS" : "Warp + DNS over HTTPS", value: "warp+doh" }
        ];

        // Преобразуем в формат для Dropdown
        const dropdownOptions = modeOptions.map(opt => ({
            label: opt.label,
            data: opt.value
        }));

        // Получаем текущую опцию
        const currentOption = dropdownOptions.find(opt => opt.data === currentMode) || dropdownOptions[2];

        // Функция для блокировки Dropdown
        const isDropdownDisabled = () => {
            return isChangingMode || st !== "connected" || st === "missing" || st === "installing" || st === "error";
        };

        // Обработчик смены режима через Dropdown
        const handleDropdownChange = (selected) => {
            if (selected.data !== currentMode && !isDropdownDisabled()) {
                handleModeChange(selected.data);
            }
        };

        // Описания режимов
        const modeDescriptions = {
            'warp': ru
            ? ["Только WARP (аналог VPN)",
 "• ВЕСЬ трафик (включая игры) идёт через Cloudflare",
 "• Всё шифруется",
 "• IP в интернете становится IP Cloudflare",
 "• Пинг в онлайн играх может вырасти или уменьшиться"]
 : ["WARP only (VPN-like)",
 "• ALL traffic (including games) goes through Cloudflare",
 "• Everything is encrypted",
 "• Internet IP becomes Cloudflare IP",
 "• Ping in online games may increase or decrease"],

 'doh': ru
 ? ["DNS через HTTPS",
 "• Шифруются только DNS-запросы",
 "• Игровой трафик (UDP/TCP) идёт напрямую",
 "• Не влияет на пинг в онлайн играх",
 "• Не скрывает IP в игре",
 "• Не обходит региональные блокировки"]
 : ["DNS over HTTPS",
 "• Only DNS queries are encrypted",
 "• Game traffic (UDP/TCP) goes directly",
 "• Does not affect ping in online games",
 "• Does not hide IP in games",
 "• Does not bypass regional blocks"],

 'warp+doh': ru
 ? ["WARP + DNS через HTTPS",
 "• Это WARP, но DNS тоже принудительно через DoH",
 "• Для игр разницы почти нет по сравнению с WARP",
 "• Нужен, чтобы максимально закрыть трафик"]
 : ["WARP + DNS over HTTPS",
 "• This is WARP, but DNS is also forced through DoH",
 "• Almost no difference for games compared to WARP",
 "• Needed to maximally secure traffic"]
        };

        return (window.SP_REACT.createElement(deckyFrontendLib.PanelSection, null,
                                              window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null, txt(ru, st)),

                                              // Отладочная информация
                                              window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                            window.SP_REACT.createElement("div", { style: {
                                                                                fontSize: "10px",
                                                                                color: "#666",
                                                                                marginBottom: "8px"
                                                                            } }, debugInfo || "No debug info")),

                                              st === "missing" ? (
                                                  window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                window.SP_REACT.createElement(deckyFrontendLib.ButtonItem, {
                                                                                    layout: "below",
                                                                                    onClick: async () => {
                                                                                        setSt("installing");
                                                                                        await install_warp();
                                                                                    }
                                                                                }, ru ? "Установить Cloudflare WARP" : "Install Cloudflare WARP"))
                                              ) : st === "installing" ? (
                                                  window.SP_REACT.createElement(React.Fragment, null,
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("progress", { style: { width: "100%" } })),
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("code", { style: { fontSize: 12 } }, log || "…")))
                                              ) : (
                                                  window.SP_REACT.createElement(React.Fragment, null,
                                                                                // Основной тугл WARP
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement(deckyFrontendLib.ToggleField, {
                                                                                                                  label: "Cloudflare WARP",
                                                                                                                  checked: st === "connected",
                                                                                                                  onChange: async () => {
                                                                                                                      const newState = await toggle_warp();
                                                                                                                      setSt(newState);
                                                                                                                  }
                                                                                                              })),

                                                                                // Разделитель
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  height: "1px",
                                                                                                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                                                                                                            margin: "16px 0"
                                                                                                              } })),

                                                                                // Заголовок режимов
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  fontSize: "14px",
                                                                                                                  color: "rgba(255, 255, 255, 0.7)",
                                                                                                                                            marginBottom: "8px"
                                                                                                              } }, ru ? "Выберите режим:" : "Select mode:")),

                                                                                // Dropdown для выбора режима
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement(deckyFrontendLib.Dropdown, {
                                                                                                                  rgOptions: dropdownOptions,
                                                                                                                  selectedOption: currentOption,
                                                                                                                  onChange: handleDropdownChange,
                                                                                                                  disabled: isDropdownDisabled(),
                                                                                                                                            strDefaultLabel: modeText
                                                                                                              })),

                                                                                // Разделитель перед описаниями
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  height: "1px",
                                                                                                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                                                                                                                            margin: "16px 0"
                                                                                                              } })),

                                                                                // Заголовок описаний
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  fontSize: "13px",
                                                                                                                  color: "rgba(255, 255, 255, 0.7)",
                                                                                                                                            marginBottom: "12px",
                                                                                                                                            fontStyle: "italic"
                                                                                                              } }, ru ? "Описание режимов:" : "Mode descriptions:")),

                                                                                // Описание режима WARP
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  backgroundColor: "rgba(30, 34, 36, 0.5)",
                                                                                                                                            borderRadius: "4px",
                                                                                                                                            padding: "10px",
                                                                                                                                            marginBottom: "8px",
                                                                                                                                            fontSize: "11px",
                                                                                                                                            color: "#aaa",
                                                                                                                                            lineHeight: "1.4",
                                                                                                                                            borderLeft: `3px solid ${currentMode === 'warp' ? '#4CAF50' : '#666'}`
                                                                                                              } },
                                                                                                              modeDescriptions['warp'].map((line, index) =>
                                                                                                              window.SP_REACT.createElement("div", {
                                                                                                                  key: index,
                                                                                                                  style: {
                                                                                                                      marginBottom: index === 0 ? "6px" : "3px",
                                                                                                                      color: index === 0 ? (currentMode === 'warp' ? '#4CAF50' : '#fff') : '#aaa',
                                                                                                                                            fontWeight: index === 0 ? "bold" : "normal"
                                                                                                                  }
                                                                                                              }, line)
                                                                                                              )
                                                                                                              )),

                                                                                // Описание режима DoH
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  backgroundColor: "rgba(30, 34, 36, 0.5)",
                                                                                                                                            borderRadius: "4px",
                                                                                                                                            padding: "10px",
                                                                                                                                            marginBottom: "8px",
                                                                                                                                            fontSize: "11px",
                                                                                                                                            color: "#aaa",
                                                                                                                                            lineHeight: "1.4",
                                                                                                                                            borderLeft: `3px solid ${currentMode === 'doh' ? '#4CAF50' : '#666'}`
                                                                                                              } },
                                                                                                              modeDescriptions['doh'].map((line, index) =>
                                                                                                              window.SP_REACT.createElement("div", {
                                                                                                                  key: index,
                                                                                                                  style: {
                                                                                                                      marginBottom: index === 0 ? "6px" : "3px",
                                                                                                                      color: index === 0 ? (currentMode === 'doh' ? '#4CAF50' : '#fff') : '#aaa',
                                                                                                                                            fontWeight: index === 0 ? "bold" : "normal"
                                                                                                                  }
                                                                                                              }, line)
                                                                                                              )
                                                                                                              )),

                                                                                // Описание режима WARP+DoH
                                                                                window.SP_REACT.createElement(deckyFrontendLib.PanelSectionRow, null,
                                                                                                              window.SP_REACT.createElement("div", { style: {
                                                                                                                  backgroundColor: "rgba(30, 34, 36, 0.5)",
                                                                                                                                            borderRadius: "4px",
                                                                                                                                            padding: "10px",
                                                                                                                                            fontSize: "11px",
                                                                                                                                            color: "#aaa",
                                                                                                                                            lineHeight: "1.4",
                                                                                                                                            borderLeft: `3px solid ${currentMode === 'warp+doh' ? '#4CAF50' : '#666'}`
                                                                                                              } },
                                                                                                              modeDescriptions['warp+doh'].map((line, index) =>
                                                                                                              window.SP_REACT.createElement("div", {
                                                                                                                  key: index,
                                                                                                                  style: {
                                                                                                                      marginBottom: index === 0 ? "6px" : "3px",
                                                                                                                      color: index === 0 ? (currentMode === 'warp+doh' ? '#4CAF50' : '#fff') : '#aaa',
                                                                                                                                            fontWeight: index === 0 ? "bold" : "normal"
                                                                                                                  }
                                                                                                              }, line)
                                                                                                              )
                                                                                                              ))
                                                  )
                                              )
        ));
    };

    const TitleView = () => {
        const openSettings = () => {
            deckyFrontendLib.Navigation.CloseSideMenus();
            deckyFrontendLib.Navigation.Navigate("/deckywarp/settings");
        };
        return (window.SP_REACT.createElement(deckyFrontendLib.Focusable, { style: {
            display: "flex",
            padding: "0",
            width: "100%",
            boxShadow: "none",
            alignItems: "center",
            justifyContent: "space-between",
        }, className: deckyFrontendLib.staticClasses.Title },
        window.SP_REACT.createElement("div", { style: { marginLeft: 8 } }, "DeckyWARP"),
                                              window.SP_REACT.createElement(deckyFrontendLib.DialogButton, { style: { height: "28px", width: "40px", minWidth: 0, padding: "10px 12px" }, onClick: openSettings },
                                                                            window.SP_REACT.createElement(BsGearFill, { style: { marginTop: "-4px", display: "block" } }))));
    };

    window.call = call;
    var index = deckyFrontendLib.definePlugin((serverAPI) => {
        setServerAPI(serverAPI);
        serverAPI.routerHook.addRoute("/deckywarp/settings", () => (window.SP_REACT.createElement(SettingsPageRouter, { serverAPI: serverAPI })));
        return {
            titleView: window.SP_REACT.createElement(TitleView, null),
                                              content: window.SP_REACT.createElement(Content, null),
                                              icon: window.SP_REACT.createElement(FaCloud, null),
        };
    });

    return index;

})(DFL, SP_REACT);

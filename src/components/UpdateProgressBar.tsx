import React from "react";

type Props = {
  percent?: number;
  error?: boolean;
  indeterminate?: boolean;
};

export const UpdateProgressBar = ({
  percent = 0,
  error = false,
  indeterminate = false,
}: Props) => {
  const fillColor = error ? "rgb(198, 74, 74)" : "rgb(26, 159, 255)";

  return (
    <div style={{ width: "100%", padding: "4px 0" }}>
      <div
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "3px",
          backgroundColor: "rgb(43, 51, 55)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: indeterminate ? "35%" : `${Math.max(0, Math.min(100, percent))}%`,
            borderRadius: "3px",
            backgroundColor: fillColor,
            transition: indeterminate ? "none" : "width 0.4s ease",
            animation: indeterminate
              ? "deckywarp-progress-indeterminate 1.2s ease-in-out infinite"
              : undefined,
          }}
        />
      </div>
      <style>{`
        @keyframes deckywarp-progress-indeterminate {
          0% { margin-left: 0; }
          50% { margin-left: 65%; }
          100% { margin-left: 0; }
        }
      `}</style>
    </div>
  );
};

const UPDATE_STAGE_MARKERS: Array<{ id: string; percent: number; markers: string[] }> = [
  { id: "done", percent: 100, markers: ["== DONE:", "ALREADY UP TO DATE"] },
  { id: "restart", percent: 90, markers: ["== RESTARTING DECKY =="] },
  { id: "install", percent: 65, markers: ["== INSTALLING FILES ==", "== COPYING PLUGIN ==", "== UNZIPPING =="] },
  { id: "download", percent: 40, markers: ["Downloaded zip:", "== DOWNLOADING ZIP =="] },
  { id: "fetch", percent: 15, markers: ["== FETCHING ASSET URL ==", "== START UPDATE:", "== UPDATE REQUESTED"] },
];

export const isUpdateLogFailed = (log: string) => {
  if (!log.includes("ERROR:")) return false;
  if (log.includes("== DONE:") || log.includes("ALREADY UP TO DATE")) return false;
  const progressMarkers = [
    "== RESTARTING DECKY ==",
    "== INSTALLING FILES ==",
    "== UNZIPPING ==",
    "== DOWNLOADING ZIP ==",
    "== FETCHING ASSET URL ==",
    "== START UPDATE:",
  ];
  let lastProgress = -1;
  for (const marker of progressMarkers) {
    const idx = log.lastIndexOf(marker);
    if (idx > lastProgress) lastProgress = idx;
  }
  return log.lastIndexOf("ERROR:") > lastProgress;
};

export const getUpdateStepFromLog = (log: string) => {
  if (isUpdateLogFailed(log)) return { id: "error", percent: 0 };

  let best = { id: "fetch", percent: 5 };
  let bestIdx = -1;
  for (const stage of UPDATE_STAGE_MARKERS) {
    for (const marker of stage.markers) {
      const idx = log.lastIndexOf(marker);
      if (idx > bestIdx) {
        bestIdx = idx;
        best = { id: stage.id, percent: stage.percent };
      }
    }
  }
  return best;
};

export type UpdateProgressState = {
  step: string;
  percent: number;
  log: string;
  done: boolean;
  failed: boolean;
};

export const applyUpdateProgressResult = (
  result: Partial<UpdateProgressState> | string | null | undefined
): UpdateProgressState | null => {
  if (!result) return null;

  if (typeof result === "string") {
    const step = getUpdateStepFromLog(result);
    return {
      step: step.id,
      percent: step.percent,
      log: result,
      done: result.includes("== DONE:") || result.includes("ALREADY UP TO DATE"),
      failed: isUpdateLogFailed(result),
    };
  }

  return {
    step: result.step || "fetch",
    percent: result.percent ?? 5,
    log: result.log || "",
    done: !!result.done,
    failed: !!result.failed,
  };
};

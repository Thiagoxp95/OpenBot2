import { app, BrowserWindow, ipcMain } from "electron";
import updater from "electron-updater";

const { autoUpdater } = updater;

const POLL_INTERVAL_MS = 4 * 60 * 1000;

export type UpdateState =
  | { status: "disabled" }
  | { status: "idle" }
  | { status: "checking" }
  | { status: "up-to-date" }
  | { status: "available"; version: string }
  | { status: "downloading"; version: string; percent: number }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };

let state: UpdateState = { status: app.isPackaged ? "idle" : "disabled" };

function setState(next: UpdateState) {
  state = next;
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("updates:state", state);
  }
}

// electron-updater errors carry full HTTP headers after the first line.
function firstLine(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).split("\n")[0] ?? "";
}

function check() {
  // A downloaded update stays ready to install; polling again would only re-download it.
  if (state.status === "downloaded" || state.status === "downloading") return;
  autoUpdater.checkForUpdates().catch((error: unknown) => {
    setState({ status: "error", message: firstLine(error) });
  });
}

export function startUpdates() {
  ipcMain.handle("updates:get", () => state);
  ipcMain.handle("updates:install", () => {
    if (state.status === "downloaded") autoUpdater.quitAndInstall();
  });

  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  let pendingVersion = "";
  autoUpdater.on("checking-for-update", () => setState({ status: "checking" }));
  autoUpdater.on("update-not-available", () => setState({ status: "up-to-date" }));
  autoUpdater.on("update-available", (info) => {
    pendingVersion = info.version;
    setState({ status: "available", version: info.version });
  });
  autoUpdater.on("download-progress", (progress) =>
    setState({ status: "downloading", version: pendingVersion, percent: Math.round(progress.percent) }),
  );
  autoUpdater.on("update-downloaded", (info) => setState({ status: "downloaded", version: info.version }));
  autoUpdater.on("error", (error) => setState({ status: "error", message: firstLine(error) }));

  check();
  setInterval(check, POLL_INTERVAL_MS);
}

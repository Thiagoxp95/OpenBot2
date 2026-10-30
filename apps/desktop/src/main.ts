import { join } from "node:path";
import { app, BrowserWindow } from "electron";
import { startUpdates } from "./updates.js";

function createWindow() {
  const window = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: join(import.meta.dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      additionalArguments: [`--app-version=${app.getVersion()}`],
    },
  });
  void window.loadFile(join(import.meta.dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  startUpdates();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

import type { IpcRendererEvent } from "electron";
import electron = require("electron");

const { contextBridge, ipcRenderer } = electron;

contextBridge.exposeInMainWorld("openbot", {
  version: process.argv.find((arg) => arg.startsWith("--app-version="))?.slice("--app-version=".length) ?? "",
  getUpdateState: () => ipcRenderer.invoke("updates:get"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  onUpdateState: (listener: (state: unknown) => void) => {
    const handler = (_event: IpcRendererEvent, state: unknown) => listener(state);
    ipcRenderer.on("updates:state", handler);
    return () => ipcRenderer.off("updates:state", handler);
  },
});

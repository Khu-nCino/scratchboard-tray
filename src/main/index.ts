import { app, ipcMain, BrowserWindow } from "electron";
import { Menubar } from "menubar";
import { IpcRendererEvent } from "common/IpcEvent";
import { isDevelopment } from "./common-config";
import { loginItemSettingsIpc } from "./login-settings-ipc";
import { updateManagerIpc } from "./update-manager-ipc";
import { createMenubar } from "./menubar-config";
import { registerGlobalShortcuts } from "./global-shortcuts";
import { createDebugWindow } from "./debug-window-config";

let mb: Menubar | undefined;
let debugWindow: BrowserWindow | undefined;
let showFunction: Function | undefined;

if (!isDevelopment) {
  mb = createMenubar();
  showFunction = mb.showWindow.bind(mb);
} else {
  app.on("ready", () => {
    debugWindow = createDebugWindow();
    showFunction = debugWindow.show.bind(debugWindow);
    registerGlobalShortcuts(debugWindow);
  });
}

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

app.on("ready", () => {
  updateManagerIpc();
  loginItemSettingsIpc();

  const { wasOpenedAsHidden } = app.getLoginItemSettings();
  if (!wasOpenedAsHidden) {
    showFunction?.();
  }
});

app.on("activate", () => {
  showFunction?.();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(IpcRendererEvent.EXIT_APP, () => {
  app.exit();
});

import { app, ipcMain, BrowserWindow, shell } from "electron";
import { Menubar } from "menubar";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcRendererEvent } from "common/IpcEvent";
import { isDevelopment } from "./common-config";
import { loginItemSettingsIpc } from "./login-settings-ipc";
import { updateManagerIpc } from "./update-manager-ipc";
import { createMenubar } from "./menubar-config";
import { createDebugWindow } from "./debug-window-config";

let mb: Menubar | undefined;
let debugWindow: BrowserWindow | undefined;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

if (!isDevelopment) {
  mb = createMenubar();
  mb.on("after-hide", () => {
    app.hide();
  });
} else {
  app.on("ready", () => {
    debugWindow = createDebugWindow();

    debugWindow.on("ready-to-show", () => {
      debugWindow?.show();
    });
  });
}

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

app.on("ready", () => {
  updateManagerIpc();
  loginItemSettingsIpc();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(IpcRendererEvent.QUIT_APP, () => {
  app.quit();
});

ipcMain.on(IpcRendererEvent.OPEN_EXTERNAL, (_event, url) => {
  shell.openExternal(url);
});

ipc.answerRenderer(IpcRendererEvent.SHOW_APPDATA_IN_FOLDER, () => {
  shell.showItemInFolder(app.getPath("userData"));
});

ipc.answerRenderer(IpcRendererEvent.SHOW_LOGS_IN_FOLDER, () => {
  shell.showItemInFolder(app.getPath("logs"));
});
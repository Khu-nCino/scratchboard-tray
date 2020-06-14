import { app, ipcMain, BrowserWindow, shell } from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcRendererEvent } from "common/IpcEvent";
import { isDevelopment } from "./common-config";
import { loginItemSettingsIpc } from "./login-settings-ipc";
import { updateManagerIpc } from "./update-manager-ipc";
import { createMenubar } from "./menubar-config";
import { createDebugWindow } from "./debug-window-config";
import { getLogDir } from "common/logger";
import { Menubar } from "./menubar";

let debugWindow: BrowserWindow | undefined;
let menubar: Menubar | undefined;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

if (process.env.SB_DEV !== 'true' && (process.env.SB_DEV === 'false' || !isDevelopment)) {
  menubar = createMenubar();
} else {
  app.on("ready", async () => {
    debugWindow = await createDebugWindow();

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

ipcMain.on(IpcRendererEvent.REQUEST_FOCUS, () => {
  menubar?.showWindow();
  debugWindow?.show();
});

ipc.answerRenderer(IpcRendererEvent.GET_APP_VERSION, () => app.getVersion());

ipc.answerRenderer(IpcRendererEvent.SHOW_APP_DATA_IN_FOLDER, () => {
  shell.openPath(app.getPath("userData"));
});

ipc.answerRenderer(IpcRendererEvent.SHOW_LOGS_IN_FOLDER, () => {
  shell.openPath(getLogDir());
});

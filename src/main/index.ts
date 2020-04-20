import { app, ipcMain } from "electron";
import installExtensions, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { IpcRendererEvent } from "common/IpcEvent";
import { isDevelopment } from './common-config';
import { loginItemSettingsIpc } from "./login-settings-ipc";
import { updateManagerIpc } from "./update-manager-ipc";
import { createMenubar } from "./menubar-config";
import { registerGlobalShortcuts } from "./global-shortcuts";

const mb = createMenubar();

mb.on("after-create-window", () => {
  if (mb.window) {
    registerGlobalShortcuts(mb.window);
  }
});

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

app.on("ready", () => {
  if (isDevelopment) {
    installExtensions([
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS,
    ]);
  }

  updateManagerIpc();
  loginItemSettingsIpc();

  const { wasOpenedAsHidden } = app.getLoginItemSettings();
  if (!wasOpenedAsHidden) {
    mb.showWindow();
  }
});

app.on("activate", () => {
  mb.showWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(IpcRendererEvent.EXIT_APP, () => {
  app.exit();
});

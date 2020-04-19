import { app, ipcMain } from "electron";
import installExtensions, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { isDevelopment } from './common-config';
import { loginItemSettingsHooks } from "./login-hooks";
import { UpdateManager } from "./UpdateManager";
import { createMenubar } from "./menubar-config";

const mb = createMenubar();
const updateManager = new UpdateManager();

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

app.on("ready", () => {
  if (isDevelopment) {
    installExtensions([
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS,
    ]);
  }

  updateManager.listenIpc();
  loginItemSettingsHooks(app);

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

ipcMain.on("exit", () => {
  app.exit();
});

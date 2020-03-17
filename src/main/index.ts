import { app, ipcMain } from "electron";
import WindowManager from "./WindowManager";
import TrayManager from "./TrayManager";
import { loginItemSettingsHooks } from "./hooks";

const isDevelopment = process.env.NODE_ENV !== "production";

const windowManager = new WindowManager();
const trayManager = new TrayManager();

windowManager.setAnchor(trayManager);
trayManager.onClick(() => windowManager.toggleVisibility());

function ready() {
  trayManager.show();

  loginItemSettingsHooks(app)

  const { wasOpenedAsHidden } = app.getLoginItemSettings();
  if (!wasOpenedAsHidden) {
    windowManager.show();
  }
}

function onWindowsAllClosed() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

if (!isDevelopment) {
  app.dock.hide();
}

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();
app.on("ready", ready);
app.on("activate", windowManager.show);
app.on("window-all-closed", onWindowsAllClosed);

ipcMain.on("exit", () => {
  app.exit();
});

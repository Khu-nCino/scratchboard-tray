import { app, ipcMain } from "electron";
import fixPath from "../common/fixpath";
import WindowManager from "./WindowManager";
import TrayManager from "./TrayManager";

const isDevelopment = process.env.NODE_ENV !== "production";

const windowManager = new WindowManager();
const trayManager = new TrayManager(windowManager);

function ready() {
  fixPath();
  trayManager.activate();
  if (isDevelopment) {
    windowManager.showWindow(0);
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
app.on("window-all-closed", onWindowsAllClosed);

ipcMain.on("exit", () => {
  app.exit();
});

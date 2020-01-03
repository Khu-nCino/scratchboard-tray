import { app } from "electron";
import WindowManager from "./WindowManager";
import TrayManager from "./TrayManager";

const windowManager = new WindowManager();
const trayManager = new TrayManager(windowManager);

function ready() {
  trayManager.activate();
}

function onWindowsAllClosed() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

app.disableHardwareAcceleration();
app.dock.hide();
app.on("ready", ready);
app.on("window-all-closed", onWindowsAllClosed);

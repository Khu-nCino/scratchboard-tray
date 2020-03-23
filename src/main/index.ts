import { app, ipcMain, nativeImage, Rectangle } from "electron";
import { format as formatUrl } from "url";
import path from "path";
import { menubar } from "menubar";
import { loginItemSettingsHooks } from "./login-hooks";
import { IpcEvent } from "../common/IpcEvent";
import { UpdateManager } from "./UpdateManager";

const isDevelopment = process.env.NODE_ENV !== "production";

const indexUrl = isDevelopment
  ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
  : formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    });

const img = nativeImage.createFromDataURL(require("./cloudTemplate.png"));
img.isMacTemplateImage = true;

const mb = menubar({
  index: indexUrl,
  icon: img,
  showDockIcon: isDevelopment,
  browserWindow: {
    width: 420,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  }
});

mb.on('ready', () => {
  if (process.platform === 'darwin') {
    mb.tray.setIgnoreDoubleClickEvents(true);
  }
});

mb.on('after-create-window', () => {
  if (process.platform === 'darwin') {
    const oldCalculate = mb.positioner.calculate.bind(mb.positioner);
    mb.positioner.calculate = function (position: string, trayBounds: Rectangle) {
      if (position === 'trayCenter') {
        const { x, y } = oldCalculate(position, trayBounds);
        return { x, y: y + 7 };
      }
      return oldCalculate(position, trayBounds);
    }
  }
});

mb.on('show', () => {
  mb.window?.webContents.send(IpcEvent.WINDOW_OPENED);
});

const updateManager = new UpdateManager();
updateManager.listenIpc();

app.allowRendererProcessReuse = true;
app.disableHardwareAcceleration();

app.on('ready', () => {
  loginItemSettingsHooks(app);

  const { wasOpenedAsHidden } = app.getLoginItemSettings();
  if (!wasOpenedAsHidden) {
    mb.showWindow();
  }
});

app.on('activate', () => {
  mb.showWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("exit", () => {
  app.exit();
});

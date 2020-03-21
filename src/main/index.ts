import { app, ipcMain, nativeImage } from "electron";
import { format as formatUrl } from "url";
import path from "path";
import { menubar } from "menubar";
import { loginItemSettingsHooks } from "./hooks";
import { IpcEvent } from "../common/IpcEvent";

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

mb.on('show', () => {
  mb.window?.webContents.send(IpcEvent.WINDOW_OPENED);
});

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

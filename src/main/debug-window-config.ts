import { BrowserWindow } from "electron";
import { browserWindowConfig, indexUrl } from "./common-config";

export function createDebugWindow() {
  // requiring instead of importing because it's a dev dependance and wont be packaged
  const {
    default: installExtensions,
  }: {
    default: (names: string[]) => void;
  } = require("electron-devtools-installer");

  installExtensions(["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"]);

  const browserWindow = new BrowserWindow({
    ...browserWindowConfig,
    resizable: true,
  });
  browserWindow.loadURL(indexUrl);
  browserWindow.webContents.openDevTools();

  return browserWindow;
}

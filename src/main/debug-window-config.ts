import { BrowserWindow } from "electron";
import { browserWindowConfig, indexUrl } from "./common-config";
import { getLogger } from "common/logger";

function setupExtensions() {
  //requiring instead of importing because it's a dev dependance and wont be packaged
  const {
    default: installExtensions,
  }: {
    default: (names: string[], forceDownload?: boolean) => Promise<string>;
  } = require("electron-devtools-installer");

  const logger = getLogger();

  installExtensions(["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"], true)
    .then((message) => logger.debug(`Extension installed: ${message}`))
    .catch((error) => logger.error(error));
}

export function createDebugWindow() {
  setupExtensions();

  const browserWindow = new BrowserWindow({
    ...browserWindowConfig,
    resizable: true,
  });
  browserWindow.loadURL(indexUrl);
  browserWindow.webContents.openDevTools();

  return browserWindow;
}

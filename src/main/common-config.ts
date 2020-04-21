import { app, BrowserWindowConstructorOptions } from "electron";
import path from "path";
import { format as formatUrl } from "url";

export const isDevelopment = process.env.NODE_ENV !== "production";

export const indexUrl = isDevelopment
  ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
  : formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true,
    });

export const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, "assets")
  : "assets";

export const browserWindowConfig: BrowserWindowConstructorOptions = {
  width: 380,
  height: 500,
  resizable: false,
  webPreferences: {
    nodeIntegration: true,
  },
};

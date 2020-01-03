import { BrowserWindow, Event } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";

const TOP_MARGIN = 30;
const WIDTH = 400;
const HEIGHT = 600;

const isDevelopment = process.env.NODE_ENV !== "production";

const indexUrl = isDevelopment
  ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
  : formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    });

export default class WindowManager {
  browserWindow?: BrowserWindow;

  constructor() {
    this.handleClose = this.handleClose.bind(this);
    this.showWindow = this.showWindow.bind(this);
  }

  showWindow(x: number) {
    const windowX = x - WIDTH / 2;
    const windowY = TOP_MARGIN;

    if (typeof this.browserWindow === "undefined") {
      const window = new BrowserWindow({
        width: WIDTH,
        height: HEIGHT,
        x: windowX,
        y: windowY,
        frame: isDevelopment,
        resizable: false,
        webPreferences: {
          nodeIntegration: true
        }
      });
      window.on("close", this.handleClose);
      window.loadURL(indexUrl);

      if (isDevelopment) {
        window.webContents.openDevTools();
      } else {
        window.on("blur", this.handleClose);
      }

      this.browserWindow = window;
    } else {
      this.browserWindow.setPosition(windowX, windowY);
      this.browserWindow.show();
    }

    return this.browserWindow;
  }

  hideWindow() {
    if (typeof this.browserWindow !== "undefined") {
      this.browserWindow.hide();
    }
  }

  isWindowVisible() {
    return typeof this.browserWindow !== "undefined" && this.browserWindow.isVisible();
  }

  handleClose(event: Event) {
    if (typeof this.browserWindow !== "undefined") {
      this.browserWindow.hide();
    }
    event.preventDefault();
  }
}

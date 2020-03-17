import { BrowserWindow } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import { IpcEvent } from "../common/IpcEvent";
import { Anchor } from "./Anchor";

const TOP_MARGIN = 30;
const WIDTH = 420;
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
  anchor?: Anchor;

  constructor() {
    this.handleClose = this.handleClose.bind(this);
    this.hideWindow = this.hideWindow.bind(this);
    this.show = this.show.bind(this);
  }

  setAnchor(anchor: Anchor) {
    this.anchor = anchor;
  }

  show() {
    const windowX = (this.anchor?.getX() ?? 0) - WIDTH / 2;
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
      window.loadURL(indexUrl);

      if (isDevelopment) {
        window.webContents.openDevTools();
      } else {
        window.on("blur", this.hideWindow);
      }
      window.on("close", this.handleClose);

      this.browserWindow = window;
    } else {
      this.browserWindow.setPosition(windowX, windowY);
      this.browserWindow.show();
    }

    this.browserWindow.webContents.send(IpcEvent.WINDOW_OPENED);

    return this.browserWindow;
  }

  handleClose() {
    delete this.browserWindow;
  }

  hideWindow() {
    if (typeof this.browserWindow !== "undefined") {
      this.browserWindow.hide();
    }
  }

  isWindowVisible() {
    return (
      typeof this.browserWindow !== "undefined" &&
      this.browserWindow.isVisible()
    );
  }

  toggleVisibility() {
    if (this.isWindowVisible()) {
      this.hideWindow();
    } else {
      this.show();
    }
  }
}

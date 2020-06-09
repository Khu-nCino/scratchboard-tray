import { BrowserWindow, Tray } from "electron";
import Positioner from "electron-positioner";
import { EventEmitter } from "events";
import { Options } from "./types";
import { cleanOptions } from "./util/cleanOptions";
import { getWindowPosition } from "./util/getWindowPosition";

/**
 * The main Menubar class.
 *
 * @noInheritDoc
 */
export class Menubar extends EventEmitter {
  private _app: Electron.App;
  private _browserWindow?: BrowserWindow;
  private _blurTimeout: NodeJS.Timeout | null = null; // track blur events with timeout
  private _isVisible: boolean; // track visibility
  private _options: Options;
  private _positioner: any;
  private _tray?: Tray;

  constructor(app: Electron.App, options?: Partial<Options>) {
    super();
    this._app = app;
    this._options = cleanOptions(options);
    this._isVisible = false;

    if (app.isReady()) {
      process.nextTick(() => this.appReady().catch((err) => console.error("menubar: ", err)));
    } else {
      app.on("ready", () => {
        this.appReady().catch((err) => console.error("menubar: ", err));
      });
    }
  }

  /**
   * The Electron [App](https://electronjs.org/docs/api/app)
   * instance.
   */
  get app(): Electron.App {
    return this._app;
  }

  /**
   * The [electron-positioner](https://github.com/jenslind/electron-positioner)
   * instance.
   */
  get positioner(): any {
    if (!this._positioner) {
      throw new Error(
        "Please access `this.positioner` after the `after-create-window` event has fired."
      );
    }

    return this._positioner;
  }

  /**
   * The Electron [Tray](https://electronjs.org/docs/api/tray) instance.
   */
  get tray(): Tray {
    if (!this._tray) {
      throw new Error("Please access `this.tray` after the `ready` event has fired.");
    }

    return this._tray;
  }

  /**
   * The Electron [BrowserWindow](https://electronjs.org/docs/api/browser-window)
   * instance, if it's present.
   */
  get window(): BrowserWindow | undefined {
    return this._browserWindow;
  }

  /**
   * Hide the menubar window.
   */
  hideWindow(): void {
    if (!this._browserWindow || !this._isVisible) {
      return;
    }
    this.emit("hide");
    this._browserWindow.hide();
    this.emit("after-hide");
    this._isVisible = false;
    if (this._blurTimeout) {
      clearTimeout(this._blurTimeout);
      this._blurTimeout = null;
    }
  }

  /**
   * Show the menubar window.
   *
   * @param trayPos - The bounds to show the window in.
   */
  async showWindow(trayPos?: Electron.Rectangle): Promise<void> {
    if (!this.tray) {
      throw new Error("Tray should have been instantiated by now");
    }

    if (!this._browserWindow) {
      await this.createWindow();
    }

    if (!this._browserWindow) {
      throw new Error("Window has been initialized just above. qed.");
    }
    this.emit("show");

    const position = this.positioner.calculate(this._options.windowPosition, trayPos || this.tray.getBounds()) as {
      x: number;
      y: number;
    };

    const x = this._options.browserWindow.x ?? position.x;
    let y = this._options.browserWindow.y ?? position.y;

    // Multi-Taskbar: optimize vertical position
    if (process.platform === "win32") {
      if (
        trayPos &&
        this._options.windowPosition &&
        this._options.windowPosition.startsWith("bottom")
      ) {
        y = trayPos.y + trayPos.height / 2 - this._browserWindow.getBounds().height / 2;
      }
    }

    if (process.platform === "darwin") {
      y += 6; // TODO find a better way to use the offset
    }

    // `.setPosition` crashed on non-integers
    this._browserWindow.setPosition(Math.round(x), Math.round(y));
    this._browserWindow.show();
    this._isVisible = true;
    this.emit("after-show");
    return;
  }

  private async appReady(): Promise<void> {
    if (this.app.dock && !this._options.showDockIcon) {
      this.app.dock.hide();
    }

    this.app.on("activate", (_event, hasVisibleWindows) => {
      if (!hasVisibleWindows) {
        this.showWindow();
      }
    });

    let trayImage = this._options.icon;
    this._tray = new Tray(trayImage);

    if (process.platform === "darwin") {
      this.tray.setIgnoreDoubleClickEvents(true);
      this.tray.on("mouse-down", this.clicked.bind(this));
    } else {
      this.tray.on("click", this.clicked.bind(this));
    }
    this.tray.setToolTip(this._options.tooltip);

    if (!this._options.windowPosition) {
      // Fill in this._options.windowPosition when taskbar position is available
      this._options.windowPosition = getWindowPosition(this.tray);
    }

    if (this._options.preloadWindow) {
      await this.createWindow();
    }

    this.emit("ready");
  }

  /**
   * Callback on tray icon click or double-click.
   *
   * @param e
   * @param bounds
   */
  private async clicked(
    event?: Electron.KeyboardEvent
  ): Promise<void> {
    if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
      return this.hideWindow();
    }

    // if blur was invoked clear timeout
    if (this._blurTimeout) {
      clearInterval(this._blurTimeout);
    }

    if (this._browserWindow && this._isVisible) {
      return this.hideWindow();
    }

    await this.showWindow();
  }

  private async createWindow(): Promise<void> {
    this.emit("create-window");

    // We add some default behavior for menubar's browserWindow, to make it
    // look like a menubar
    const defaults = {
      show: false, // Don't show it at first
      frame: false, // Remove window frame
    };

    this._browserWindow = new BrowserWindow({
      ...defaults,
      ...this._options.browserWindow,
    });

    this._positioner = new Positioner(this._browserWindow);

    this._browserWindow.on("blur", () => {
      if (!this._browserWindow) {
        return;
      }

      // hack to close if icon clicked when open
      this._browserWindow.isAlwaysOnTop()
        ? this.emit("focus-lost")
        : (this._blurTimeout = setTimeout(() => {
            this.hideWindow();
          }, 100));
    });

    if (this._options.showOnAllWorkspaces !== false) {
      this._browserWindow.setVisibleOnAllWorkspaces(true);
    }

    this._browserWindow.on("close", this.windowClear.bind(this));

    await this._browserWindow.loadURL(this._options.index, this._options.loadUrlOptions);
    this.emit("after-create-window");
  }

  private windowClear(): void {
    this._browserWindow = undefined;
    this.emit("after-close");
  }
}

import { Tray, nativeImage } from "electron";
import WindowManager from "./WindowManager";

export default class TrayManager {
  tray?: Tray;

  constructor(private windowManager: WindowManager) {
    this.handleClick = this.handleClick.bind(this);
    windowManager.setTray(this);
  }

  activate() {
    const img = nativeImage.createFromDataURL(require("./cloudTemplate.png"));
    img.isMacTemplateImage = true;

    this.tray = new Tray(img);
    this.tray.setToolTip("Scratchboard Tray");
    this.tray.setIgnoreDoubleClickEvents(true);

    this.tray.on("click", this.handleClick);
  }

  getX(): number {
    const bounds = this.tray?.getBounds();
    if (bounds === undefined) {
      return 0;
    } else {
      return bounds.x + bounds.width / 2;
    }
  }

  handleClick() {
    if (this.windowManager.isWindowVisible()) {
      this.windowManager.hideWindow();
    } else {
      this.windowManager.showWindow();
    }
  }
}

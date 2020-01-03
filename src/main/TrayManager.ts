import { Tray, nativeImage, KeyboardEvent, Rectangle } from "electron";
import WindowManager from "./WindowManager";

export default class TrayManager {
  tray?: Tray;

  constructor(private windowManager: WindowManager) {
    this.handleClick = this.handleClick.bind(this);
  }

  activate() {
    const img = nativeImage.createFromDataURL(require("./cloudTemplate.png"));
    img.isMacTemplateImage = true;

    this.tray = new Tray(img);
    this.tray.setToolTip("ScratchBoard Dock");

    this.tray.on("click", this.handleClick);
    this.tray.on("double-click", this.handleClick);
  }

  handleClick(event: KeyboardEvent, bounds: Rectangle) {
    if (this.windowManager.isWindowVisible()) {
      this.windowManager.hideWindow();
    } else {
      this.windowManager.showWindow(bounds.x + bounds.width / 2);
    }
  }
}

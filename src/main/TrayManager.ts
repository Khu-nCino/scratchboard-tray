import { Tray, nativeImage } from "electron";
import { Anchor } from "./Anchor";

export default class TrayManager implements Anchor {
  tray?: Tray;
  private clickCallback?: () => void;

  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }

  show() {
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

  getY() {
    return 0;
  }

  onClick(clickCallback: () => void) {
    this.clickCallback = clickCallback;
  }

  handleClick() {
    if (this.clickCallback !== undefined) {
      this.clickCallback();
    }
  }
}

import { nativeImage, Rectangle, Point } from "electron";
import path from "path";
import { menubar, Menubar } from "menubar";
import { IpcMainEvent } from "common/IpcEvent";
import { indexUrl, assetsPath, browserWindowConfig } from "./common-config";

export function createMenubar(): Menubar {
  const mb = menubar({
    index: indexUrl,
    icon: loadTemplateIcon("cloudTemplate@2x.png"),
    showDockIcon: false,
    browserWindow: browserWindowConfig,
  });

  mb.on("ready", () => {
    if (process.platform === "darwin") {
      mb.tray.setIgnoreDoubleClickEvents(true);
    }
  });

  mb.on("after-create-window", () => {
    if (process.platform === "darwin") {
      offsetPositioner(mb.positioner, { x: 0, y: 6 });
    }
  });

  mb.on("show", () => {
    mb.window?.webContents.send(IpcMainEvent.WINDOW_OPENED);
  });

  return mb;
}

function loadTemplateIcon(name: string) {
  const img = nativeImage.createFromPath(path.join(assetsPath, name));
  img.isMacTemplateImage = true;
  return img;
}

function offsetPositioner(
  positioner: { calculate: (position: string, trayBounds: Rectangle) => Point },
  offset: Point
) {
  positioner.calculate = offsetCalculate(
    positioner.calculate.bind(positioner),
    offset
  );
}

function offsetCalculate(
  calculate: (position: string, trayBounds: Rectangle) => Point,
  offset: Point
) {
  return (position: string, trayBounds: Rectangle) => {
    if (position === "trayCenter") {
      const { x, y } = calculate(position, trayBounds);
      return { x: x + offset.x, y: y + offset.y };
    }
    return calculate(position, trayBounds);
  };
}

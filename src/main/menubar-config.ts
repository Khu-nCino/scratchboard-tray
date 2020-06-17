import { nativeImage, app } from "electron";
import path from "path";
import { IpcMainEvent } from "common/IpcEvent";
import { menubar, Menubar } from "./menubar";
import { indexUrl, assetsPath, browserWindowConfig, isDevelopment } from "./common-config";

export function createMenubar(): Menubar {
  const mb = menubar({
    index: indexUrl,
    icon: loadTemplateIcon("cloudTemplate@2x.png"),
    showDockIcon: isDevelopment,
    showOnAllWorkspaces: true,
    preloadWindow: true,
    browserWindow: {
      ...browserWindowConfig,
      skipTaskbar: true,
    },
  });

  mb.on("show", () => {
    mb.window?.webContents.send(IpcMainEvent.WINDOW_OPENED);
  });

  mb.on("hide", () => {
    mb.window?.webContents.send(IpcMainEvent.WINDOW_CLOSED);
  });

  mb.on("after-create-window", () => {
    if (process.platform === "darwin") {
      const { wasOpenedAsHidden } = app.getLoginItemSettings();
      if (!wasOpenedAsHidden) {
        mb.showWindow();
      }
    } else if (process.platform === "win32") {
      const argsSet = new Set<string>(process.argv);
      if (!argsSet.has("--hidden")) {
        mb.showWindow();
      }
    }
  });

  return mb;
}

function loadTemplateIcon(name: string) {
  const img = nativeImage.createFromPath(path.join(assetsPath, name));
  img.isMacTemplateImage = true;
  return img;
}

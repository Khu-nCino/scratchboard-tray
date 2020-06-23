import { app } from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcRendererEvent } from "common/IpcEvent";

const WINDOWS_ARGS = ["--hidden"];

export function loginItemSettingsIpc() {
  ipc.answerRenderer(IpcRendererEvent.GET_LAUNCH_SETTINGS, () => {
    switch (process.platform) {
      case "darwin":
        return app.getLoginItemSettings().openAtLogin;
      case "win32":
        return app.getLoginItemSettings({ args: WINDOWS_ARGS }).openAtLogin;
      default:
        throw new Error(`Unsupported login setting platform: ${process.platform}`);
    }
  });

  // TODO needs windows and linux support
  ipc.answerRenderer(IpcRendererEvent.SET_LAUNCH_SETTINGS, (value: boolean) => {
    switch (process.platform) {
      case "darwin":
        app.setLoginItemSettings({
          openAtLogin: value,
          openAsHidden: true,
        });
        break;
      case "win32":
        app.setLoginItemSettings({
          openAtLogin: value,
          args: WINDOWS_ARGS,
        });
        break;
      default:
        throw new Error(`Unsupported login setting platform: ${process.platform}`);
    }
  });
}

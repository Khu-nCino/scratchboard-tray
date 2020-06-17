import { app } from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcRendererEvent } from "common/IpcEvent";

export function loginItemSettingsIpc() {
  ipc.answerRenderer(IpcRendererEvent.GET_LAUNCH_SETTINGS, () => {
    const { openAtLogin } = app.getLoginItemSettings();
    return openAtLogin;
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
          args: ["--hidden"],
        });
        break;
    }
  });
}

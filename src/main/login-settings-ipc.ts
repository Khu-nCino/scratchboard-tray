import { app } from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcRendererEvent } from "common/IpcEvent";

export function loginItemSettingsIpc() {
  ipc.answerRenderer(IpcRendererEvent.GET_LAUNCH_SETTINGS, () => {
    const { openAtLogin } = app.getLoginItemSettings();
    return openAtLogin;
  });

  ipc.answerRenderer(IpcRendererEvent.SET_LAUNCH_SETTINGS, (value: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: value,
      openAsHidden: true,
    });
  });
}

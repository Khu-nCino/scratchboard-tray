import { App, ipcMain } from 'electron';
import { IpcEvent } from '../common/IpcEvent';

export function loginItemSettingsHooks(app: App) {
  ipcMain.on(IpcEvent.LAUNCH_SETTINGS_REQUEST, (event) => {
    const { openAtLogin } = app.getLoginItemSettings();
    event.reply(IpcEvent.LAUNCH_SETTINGS_REPLY, openAtLogin);
  });

  ipcMain.on(IpcEvent.LAUNCH_SETTINGS_SET, (event, value) => {
    app.setLoginItemSettings({
      openAtLogin: value,
      openAsHidden: true
    });
  });
}
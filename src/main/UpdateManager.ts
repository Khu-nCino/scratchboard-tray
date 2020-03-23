import { ipcMain, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { getLogger } from './logger';
import { IpcEvent } from '../common/IpcEvent';

export class UpdateManager {
  constructor() {
    autoUpdater.logger = getLogger();
    autoUpdater.setFeedURL('http://0.0.0.0:8000/');
  }

  listenIpc() {
    ipcMain.on(IpcEvent.CHECK_FOR_UPDATES_REQUEST, () => {
      autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.on(IpcEvent.QUIT_AND_INSTALL_UPDATE_REQUEST, () => {
      autoUpdater.quitAndInstall();
    })

    autoUpdater.on('checking-for-update', () => {
      sendIpc(IpcEvent.CHECKING_FOR_UPDATE);
    });

    autoUpdater.on('update-available', () => {
      sendIpc(IpcEvent.UPDATE_AVAILABLE);
    });

    autoUpdater.on('update-not-available', () => {
      sendIpc(IpcEvent.UPDATE_NOT_AVAILABLE);
    });

    autoUpdater.on('update-downloaded', () => {
      sendIpc(IpcEvent.UPDATE_DOWNLOADED);
    });
  }
}

function sendIpc(channel: string, ...args: any[]) {
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send(channel, args);
  });
}
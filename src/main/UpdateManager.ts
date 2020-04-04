import { ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import { getLogger } from "../common/logger";
import { IpcEvent } from "../common/IpcEvent";

export class UpdateManager {
  constructor() {
    autoUpdater.logger = getLogger();
  }

  listenIpc() {
    ipcMain.on(IpcEvent.CHECK_FOR_UPDATES_REQUEST, () => {
      autoUpdater.checkForUpdates();
    });

    ipcMain.on(IpcEvent.QUIT_AND_INSTALL_UPDATE_REQUEST, () => {
      autoUpdater.quitAndInstall();
    });

    autoUpdater.on("error", (reason) => {
      sendIpc(IpcEvent.UPDATE_ERROR, reason.message);
    });

    autoUpdater.on("checking-for-update", () => {
      sendIpc(IpcEvent.CHECKING_FOR_UPDATE);
    });

    autoUpdater.on("update-available", (info) => {
      sendIpc(IpcEvent.UPDATE_AVAILABLE, info.version);
    });

    autoUpdater.on("update-not-available", () => {
      sendIpc(IpcEvent.UPDATE_NOT_AVAILABLE);
    });

    autoUpdater.signals.progress((info) => {
      sendIpc(IpcEvent.UPDATE_DOWNLOADING, info.percent / 100);
    });

    autoUpdater.signals.updateDownloaded((info) => {
      sendIpc(IpcEvent.UPDATE_DOWNLOADED, info.version);
    });
  }
}

function sendIpc(channel: string, ...args: any[]) {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(channel, args);
  });
}

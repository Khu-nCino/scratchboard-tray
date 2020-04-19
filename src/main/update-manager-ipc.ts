import { ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import { getLogger } from "../common/logger";
import { IpcMainEvent, IpcRendererEvent } from "../common/IpcEvent";

export function updateManagerIpc() {
  autoUpdater.logger = getLogger();
  ipcMain.on(IpcRendererEvent.CHECK_FOR_UPDATES_REQUEST, () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on(IpcRendererEvent.QUIT_AND_INSTALL_UPDATE_REQUEST, () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("error", (reason) => {
    sendIpc(IpcMainEvent.UPDATE_ERROR, reason.message);
  });

  autoUpdater.on("checking-for-update", () => {
    sendIpc(IpcMainEvent.CHECKING_FOR_UPDATE);
  });

  autoUpdater.on("update-available", (info) => {
    sendIpc(IpcMainEvent.UPDATE_AVAILABLE, info.version);
  });

  autoUpdater.on("update-not-available", () => {
    sendIpc(IpcMainEvent.UPDATE_NOT_AVAILABLE);
  });

  autoUpdater.signals.progress((info) => {
    sendIpc(IpcMainEvent.UPDATE_DOWNLOADING, info.percent / 100);
  });

  autoUpdater.signals.updateDownloaded((info) => {
    sendIpc(IpcMainEvent.UPDATE_DOWNLOADED, info.version);
  });
}

function sendIpc(channel: string, ...args: any[]) {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send(channel, args);
  });
}

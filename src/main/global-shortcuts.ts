import {
  globalShortcut,
  clipboard,
  Notification,
  BrowserWindow,
} from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcMainEvent } from "common/IpcEvent";

export function registerGlobalShortcuts(browserWindow: BrowserWindow) {
  globalShortcut.register("Ctrl+Option+Cmd+F", async () => {
    const text = clipboard.readText();

    showNotification(
      "Converting url to Frontdoor",
      text,
    );

    try {
      const frontdoor: string = await ipc.callRenderer(
        browserWindow,
        IpcMainEvent.CONVERT_URL,
        text
      );
      clipboard.writeText(frontdoor);

      showNotification(
        "Finished converting frontdoor to url",
        "You can find it in you clipboard",
      )
    } catch (error) {
      showNotification(
        "Error converting frontdoor to url",
        error,
      );
    }
  });
}

function showNotification(title: string, body: string) {
  new Notification({
    title,
    body,
    closeButtonText: 'close'
  }).show();
}
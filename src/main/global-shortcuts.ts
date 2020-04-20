import { globalShortcut, clipboard, Notification, BrowserWindow } from "electron";
import { ipcMain as ipc } from "electron-better-ipc";
import { IpcMainEvent } from "common/IpcEvent";

export function registerGlobalShortcuts(browserWindow: BrowserWindow) {
  globalShortcut.register('Ctrl+Option+Cmd+F', async () => {
    const text = clipboard.readText();

    new Notification({
      title: 'Converting url to Frontdoor',
      body: text,
    }).show();

    try {
      const frontdoor: string = await ipc.callRenderer(browserWindow, IpcMainEvent.CONVERT_URL, text);
      clipboard.writeText(frontdoor);
      
      new Notification({
        title: 'Finished converting frontdoor to url',
        body: 'You can find it in you clipboard',
      }).show();
    } catch (error) {
      new Notification({
        title: 'Error converting frontdoor to url',
        body: error,
      });
    }
  });
}
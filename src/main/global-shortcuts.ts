import { App, globalShortcut } from "electron";

export function register(app: App) {
  globalShortcut.register('CommandOrControl+X', () => {
    
  });
}
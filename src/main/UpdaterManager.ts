import { autoUpdater } from "electron-updater"

export class UpdateManager {
   constructor() {
    const log = require("electron-log")
    log.transports.file.level = "debug"
    autoUpdater.logger = log
    autoUpdater.setFeedURL('http://0.0.0.0:8000/');
    autoUpdater.checkForUpdatesAndNotify()
   }
}
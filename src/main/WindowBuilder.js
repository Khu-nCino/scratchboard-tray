import { BrowserWindow } from "electron";
import * as path from 'path';
import { format as formatUrl } from 'url'

const isDevelopment = process.env.NODE_ENV !== 'production';

export default class WindowBuilder {
    constructor() {
        this.handleClose = this.handleClose.bind(this);
        this.activateWindow = this.activateWindow.bind(this);
    }

    activateWindow() {
        if (typeof this.browserWindow === 'undefined') {
            this.browserWindow = new BrowserWindow({
                width: 800,
                height: 800,
                webPreferences: {
                    nodeIntegration: true
                },
            });
            this.browserWindow.on('close', this.handleClose);
            this.loadContent();
        }

        return this.browserWindow;
    }

    loadContent() {
        const url = isDevelopment
            ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
            : formatUrl({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file',
                slashes: true
            });
        this.browserWindow.loadURL(url);
    }

    isWindowActive() {
        return typeof this.browserWindow !== 'undefined';
    }

    handleClose() {
        this.browserWindow = undefined;
    }
}

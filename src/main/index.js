import { app } from 'electron';
import WindowBuilder from './WindowBuilder';

const windowBuilder = new WindowBuilder();

function onWindowsAllClosed() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}

app.on('ready', windowBuilder.activateWindow);
app.on('activate', windowBuilder.activateWindow);
app.on('window-all-closed', onWindowsAllClosed);
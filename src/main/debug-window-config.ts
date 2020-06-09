import path from "path";
import os from "os";
import { readdir } from "fs";
import { promisify } from "util";
import { BrowserWindow, session } from "electron";
import { notUndefined } from "common/util";
import { browserWindowConfig, indexUrl } from "./common-config";

const REDUX = "lmhkpmbekcpmknklioeibfkpmmfibljd";
const REACT = "fmkadmapgofadopljbjfkapdkoienihi";
const extensions = [REDUX, REACT];

const readDirPromise = promisify(readdir);

async function setupDevtools() {
  const baseDirectory = path.join(
    os.homedir(),
    "Library/Application Support/Google/Chrome/Default/Extensions"
  );
  const extensionPaths = await Promise.all(
    extensions
      .map((extension) => path.join(baseDirectory, extension))
      .map(async (extension) => {
        const versions = await readDirPromise(extension);
        if (versions.length > 0) {
          return path.join(extension, versions[0]);
        } else {
          return undefined;
        }
      })
  );

  await Promise.all(
    extensionPaths
      .filter(notUndefined)
      .map((version) => session.defaultSession.loadExtension(version))
  );
}

export async function createDebugWindow() {
  try {
    await setupDevtools();
  } catch (error) {
    console.error(error);
  }

  const browserWindow = new BrowserWindow({
    ...browserWindowConfig,
    resizable: true,
  });
  await browserWindow.loadURL(indexUrl);
  browserWindow.webContents.openDevTools();

  return browserWindow;
}

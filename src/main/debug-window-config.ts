import path from "path";
import os from "os";
import { readdir } from "fs";
import { promisify } from "util";
import { BrowserWindow, session } from "electron";
import { notUndefined } from "common/util";
import { getLogger } from "common/logger";
import { browserWindowConfig, indexUrl } from "./common-config";

const REDUX = "lmhkpmbekcpmknklioeibfkpmmfibljd";
const REACT = "fmkadmapgofadopljbjfkapdkoienihi";
const extensions = [REDUX, REACT];

const readDirPromise = promisify(readdir);
const logger = getLogger();

function getChromeExtensionsDir(): string | undefined {
  let baseDirectory: string | undefined;
  switch (process.platform) {
    case "win32":
      baseDirectory = "AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions";
      break;
    case "darwin":
      baseDirectory = "Library/Application Support/Google/Chrome/Default/Extensions";
      break;
    case "linux":
      baseDirectory = ".config/google-chrome/Default/Extensions";
      break;
  }

  if (baseDirectory) {
    return path.join(os.homedir(), baseDirectory);
  }
  return undefined;
}

async function setupDevtools(): Promise<void> {
  const chromeInstallDir = getChromeExtensionsDir();
  if (chromeInstallDir === undefined) {
    logger.warn(`Chrome extensions not currently supported on ${process.platform}`);
    return undefined;
  }

  const extensionPaths = await Promise.all(
    extensions
      .map((extension) => path.join(chromeInstallDir, extension))
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

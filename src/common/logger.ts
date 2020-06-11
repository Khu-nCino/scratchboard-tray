import logger from "electron-log";
import path from "path";
logger.transports.file.level = "debug";
logger.transports.console.level = "debug";
logger.catchErrors();

export function getLogger() {
  return logger;
}

export function getLogDir() {
  return path.dirname(logger.transports.file.getFile().path);
}
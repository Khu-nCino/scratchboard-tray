import logger from "electron-log";
logger.transports.file.level = "debug";
logger.transports.console.level = "debug";

export function getLogger() {
  return logger;
}

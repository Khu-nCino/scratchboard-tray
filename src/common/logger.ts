import logger from "electron-log";
logger.transports.file.level = "debug";

export function getLogger() {
  return logger;
}

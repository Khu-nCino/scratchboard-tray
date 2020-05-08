import logger from "electron-log";
logger.transports.file.level = "debug";
logger.transports.console.level = "debug";
logger.catchErrors();

export function getLogger() {
  return logger;
}

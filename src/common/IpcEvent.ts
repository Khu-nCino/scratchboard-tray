export enum IpcMainEvent {
  WINDOW_OPENED = "WINDOW_OPENED",
  WINDOW_CLOSED = "WINDOW_CLOSED",
  POWER_AWAKE = "POWER_AWAKE",

  CHECKING_FOR_UPDATE = "CHECKING_FOR_UPDATE",
  UPDATE_AVAILABLE = "UPDATE_AVAILABLE",
  UPDATE_NOT_AVAILABLE = "UPDATE_NOT_AVAILABLE",
  UPDATE_DOWNLOADED = "UPDATE_DOWNLOADED",
  UPDATE_DOWNLOADING = "UPDATE_DOWNLOADING",
  UPDATE_ERROR = "UPDATE_ERROR",

  CONVERT_URL = "CONVERT_URL",
}

export enum IpcRendererEvent {
  GET_LAUNCH_SETTINGS = "GET_LAUNCH_SETTINGS",
  SET_LAUNCH_SETTINGS = "SET_LAUNCH_SETTINGS",
  OPEN_EXTERNAL = "OPEN_EXTERNAL",

  CHECK_FOR_UPDATES_REQUEST = "CHECK_FOR_UPDATES_REQUEST",
  QUIT_AND_INSTALL_UPDATE_REQUEST = "QUIT_AND_INSTALL_UPDATE_REQUEST",
  SHOW_APPDATA_IN_FOLDER = "SHOW_APP_DATA_IN_FOLDER",
  SHOW_LOGS_IN_FOLDER = "SHOW_LOGS_IN_FOLDER",
  QUIT_APP = "EXIT_APP",
}

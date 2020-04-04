import { Action, Store } from "redux";
import { ipcRenderer } from "electron";
import { IpcEvent } from "../../common/IpcEvent";
import { createErrorToast, createToast } from "./jobs";

type UpdateAction =
  | UpdateDownloadedAction
  | UpdateDownloadingAction
  | StatusChangeAction;

interface UpdateDownloadedAction extends Action<"UPDATE_DOWNLOADED"> {
  payload: {
    updateVersion: string;
  };
}

interface UpdateDownloadingAction extends Action<"UPDATE_DOWNLOADING"> {
  payload: {
    percent: number;
  };
}

interface StatusChangeAction extends Action<"UPDATE_STATUS_CHANGE"> {
  payload: {
    status: UpdateStatus;
  };
}

function updateDownloadedAction(updateVersion: string): UpdateDownloadedAction {
  return {
    type: "UPDATE_DOWNLOADED",
    payload: {
      updateVersion,
    },
  };
}

function updateDownloadingAction(percent: number): UpdateDownloadingAction {
  return {
    type: "UPDATE_DOWNLOADING",
    payload: {
      percent,
    },
  };
}

function statusChangeAction(status: UpdateStatus): StatusChangeAction {
  return {
    type: "UPDATE_STATUS_CHANGE",
    payload: {
      status,
    },
  };
}

export function listenIpc(store: Store) {
  ipcRenderer.on(IpcEvent.UPDATE_ERROR, (_event, error) => {
    store.dispatch(statusChangeAction("initial"));
    store.dispatch(createErrorToast("Error Updating", error));
  });

  ipcRenderer.on(IpcEvent.CHECKING_FOR_UPDATE, () => {
    store.dispatch(statusChangeAction("checking"));
  });

  ipcRenderer.on(IpcEvent.UPDATE_AVAILABLE, () => {
    store.dispatch(statusChangeAction("downloading"));
  });

  ipcRenderer.on(IpcEvent.UPDATE_NOT_AVAILABLE, () => {
    store.dispatch(statusChangeAction("initial"));
    store.dispatch(createToast("No updates available", "none"));
  });

  ipcRenderer.on(IpcEvent.UPDATE_DOWNLOADING, (_event, percent) => {
    store.dispatch(updateDownloadingAction(percent));
  });

  ipcRenderer.on(IpcEvent.UPDATE_DOWNLOADED, (_event, version) => {
    store.dispatch(updateDownloadedAction(version));
  });
}

export type UpdateStatus =
  | "initial"
  | "checking"
  | "downloading"
  | "downloaded";

export interface UpdateState {
  status: UpdateStatus;
  updateVersion?: string;
  downloadPercent?: number;
}

const defaultState: UpdateState = {
  status: "initial",
};

export function updateReducer(
  state: UpdateState = defaultState,
  action: UpdateAction
): UpdateState {
  switch (action.type) {
    case "UPDATE_DOWNLOADING":
      return {
        ...state,
        downloadPercent: action.payload.percent,
      };
    case "UPDATE_DOWNLOADED":
      return {
        ...state,
        status: "downloaded",
        updateVersion: action.payload.updateVersion,
      };
    case "UPDATE_STATUS_CHANGE":
      return {
        ...state,
        status: action.payload.status,
      };
    default:
      return state;
  }
}

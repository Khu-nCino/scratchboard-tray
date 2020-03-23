import { Action, Store } from "redux";
import { ipcRenderer } from "electron";
import { IpcEvent } from "../../common/IpcEvent";

type UpdateAction = UpdateAvailableAction | StatusChangeAction;

interface UpdateAvailableAction extends Action<"UPDATE_AVAILABLE"> {
  payload: {
    updateVersion: string;
  };
}

interface StatusChangeAction extends Action<"UPDATE_STATUS_CHANGE"> {
  payload: {
    status: UpdateStatus;
  };
}

function updateAvailableAction(updateVersion: string): UpdateAvailableAction {
  return {
    type: "UPDATE_AVAILABLE",
    payload: {
      updateVersion
    }
  };
}

function statusChangeAction(status: UpdateStatus): StatusChangeAction {
  return {
    type: "UPDATE_STATUS_CHANGE",
    payload: {
      status
    }
  };
}

export function listenIpc(store: Store) {
  ipcRenderer.on(IpcEvent.CHECKING_FOR_UPDATE, () => {
    store.dispatch(statusChangeAction("checking"));
  });

  ipcRenderer.on(IpcEvent.UPDATE_AVAILABLE, (_event, version: string) => {
    store.dispatch(updateAvailableAction(version));
  });

  ipcRenderer.on(IpcEvent.UPDATE_NOT_AVAILABLE, () => {
    store.dispatch(statusChangeAction("initial"));
  });

  ipcRenderer.on(IpcEvent.UPDATE_DOWNLOADED, () => {
    store.dispatch(statusChangeAction("downloaded"));
  });
}

export type UpdateStatus = "initial" | "checking" | "downloading" | "downloaded";

export interface UpdateState {
  status: UpdateStatus;
  updateVersion?: string;
}

const defaultState: UpdateState = {
  status: "initial"
};

export function updateReducer(
  state: UpdateState = defaultState,
  action: UpdateAction
): UpdateState {
  switch (action.type) {
    case "UPDATE_AVAILABLE":
      return {
        status: "downloading",
        updateVersion: action.payload.updateVersion
      };
    case "UPDATE_STATUS_CHANGE":
      return {
        ...state,
        status: action.payload.status
      };
    default:
      return state;
  }
}

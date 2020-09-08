import { ipcRenderer as ipc } from "electron-better-ipc";
import { Action } from "redux";
import { IpcRendererEvent } from "common/IpcEvent";
import { ScratchBoardThunk } from ".";

interface ToggleThemeAction extends Action<"TOGGLE_THEME"> {}

interface ToggleShowSecondaryScratchUsernames
  extends Action<"TOGGLE_SHOW_SECONDARY_SCRATCH_USERNAMES"> {}

interface SetLaunchAtLogin extends Action<"SET_OPEN_AT_LOGIN"> {
  payload: {
    value: boolean;
  };
}

interface ToggleDisplayAllOrgs extends Action<"TOGGLE_DISPLAY_ALL_ORGS"> {}

type SettingsAction =
  | ToggleThemeAction
  | SetLaunchAtLogin
  | ToggleDisplayAllOrgs
  | ToggleShowSecondaryScratchUsernames;

export function toggleTheme(): ToggleThemeAction {
  return {
    type: "TOGGLE_THEME",
  };
}

export function checkOpenAtLogin(): ScratchBoardThunk<void> {
  return async (dispatch) => {
    const openAtLogin: boolean = await ipc.callMain(IpcRendererEvent.GET_LAUNCH_SETTINGS);

    dispatch({
      type: "SET_OPEN_AT_LOGIN",
      payload: {
        value: openAtLogin,
      },
    });
  };
}

export function toggleOpenAtLogin(): ScratchBoardThunk<void> {
  return (dispatch, getState) => {
    const value = !getState().settings.openAtLogin;
    ipc.callMain(IpcRendererEvent.SET_LAUNCH_SETTINGS, value);
    dispatch({
      type: "SET_OPEN_AT_LOGIN",
      payload: {
        value,
      },
    });
  };
}

export function toggleShowSecondaryScratchUsernames(): ToggleShowSecondaryScratchUsernames {
  return {
    type: "TOGGLE_SHOW_SECONDARY_SCRATCH_USERNAMES",
  };
}

export type UITheme = "light" | "dark";

interface SettingsState {
  readonly theme: UITheme;
  readonly openAtLogin: boolean;
  readonly showSecondaryScratchUsernames: boolean;
}

export const defaultSettingsState: SettingsState = {
  theme: "dark",
  openAtLogin: false,
  showSecondaryScratchUsernames: false,
};

export function settingsReducer(
  state: SettingsState = defaultSettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark",
      };
    case "TOGGLE_SHOW_SECONDARY_SCRATCH_USERNAMES":
      return {
        ...state,
        showSecondaryScratchUsernames: !state.showSecondaryScratchUsernames,
      };
    case "SET_OPEN_AT_LOGIN":
      return {
        ...state,
        openAtLogin: action.payload.value,
      };
    default: {
      return state;
    }
  }
}

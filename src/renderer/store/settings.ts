import { ipcRenderer as ipc } from "electron-better-ipc";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { IpcRendererEvent } from "common/IpcEvent";
import { State } from ".";

type ThunkReturn<R> = ThunkAction<R, State, undefined, SettingsAction>;

interface SetThemeAction extends Action<"SET_THEME"> {
  payload: {
    theme: UITheme;
  };
}

interface ToggleThemeAction extends Action<"TOGGLE_THEME"> {}

interface SetLaunchAtLogin extends Action<"SET_OPEN_AT_LOGIN"> {
  payload: {
    value: boolean;
  };
}

interface ToggleDisplayAllOrgs extends Action<"TOGGLE_DISPLAY_ALL_ORGS"> {}

type SettingsAction =
  | SetThemeAction
  | ToggleThemeAction
  | SetLaunchAtLogin
  | ToggleDisplayAllOrgs;

export function setTheme(theme: UITheme): SetThemeAction {
  return {
    type: "SET_THEME",
    payload: {
      theme,
    },
  };
}

export function toggleTheme(): ToggleThemeAction {
  return {
    type: "TOGGLE_THEME",
  };
}

export function checkOpenAtLogin(): ThunkReturn<void> {
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

export function toggleOpenAtLogin(): ThunkReturn<void> {
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

export type UITheme = "light" | "dark";

interface SettingsState {
  readonly theme: UITheme;
  readonly openAtLogin: boolean;
}

export const defaultSettingsState: SettingsState = {
  theme: "dark",
  openAtLogin: false,
};

export function settingsReducer(
  state: SettingsState = defaultSettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload.theme,
      };
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark",
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

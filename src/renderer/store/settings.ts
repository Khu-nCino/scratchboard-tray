import { ipcRenderer as ipc } from "electron-better-ipc";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { IpcRendererEvent } from "common/IpcEvent";
import { State } from ".";
import { validateSfdxPath } from "renderer/api/subprocess/sfdx";

type ThunkReturn<R> = ThunkAction<R, State, undefined, SettingsAction>;

interface SetThemeAction extends Action<"SET_THEME"> {
  payload: {
    theme: UITheme;
  };
}

interface ToggleThemeAction extends Action<"TOGGLE_THEME"> {}

interface SetSfdxPath extends Action<"SET_SFDX_PATH"> {
  payload: {
    sfdxPath: string;
  };
}

interface SetSfdxPathValidity extends Action<"SET_SFDX_PATH_VALIDITY"> {
  payload: {
    sfdxPath: string;
    pathIsValid: boolean;
  };
}

interface SetLaunchAtLogin extends Action<"SET_OPEN_AT_LOGIN"> {
  payload: {
    value: boolean;
  };
}

interface ToggleDisplayAllOrgs extends Action<"TOGGLE_DISPLAY_ALL_ORGS"> {}

type SettingsAction =
  | SetThemeAction
  | ToggleThemeAction
  | SetSfdxPath
  | SetSfdxPathValidity
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

export function setSfdxPath(sfdxPath: string): ThunkReturn<Promise<boolean>> {
  return async (dispatch) => {
    dispatch({
      type: "SET_SFDX_PATH",
      payload: {
        sfdxPath,
      },
    });

    return dispatch(checkSfdxPathValidity());
  };
}

export function checkSfdxPathValidity(): ThunkReturn<Promise<boolean>> {
  return async (dispatch, getState) => {
    const sfdxPath = getState().settings.sfdxPath;

    const pathIsValid = await validateSfdxPath(sfdxPath);
    dispatch({
      type: "SET_SFDX_PATH_VALIDITY",
      payload: {
        sfdxPath,
        pathIsValid,
      },
    });

    return pathIsValid;
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
  readonly sfdxPath: string;
  readonly isSfdxPathValid?: boolean;
  readonly theme: UITheme;
  readonly openAtLogin: boolean;
}

export const defaultSettingsState: SettingsState = {
  sfdxPath: "",
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
    case "SET_SFDX_PATH":
      return {
        ...state,
        sfdxPath: action.payload.sfdxPath,
      };
    case "SET_SFDX_PATH_VALIDITY":
      if (state.sfdxPath === action.payload.sfdxPath) {
        return {
          ...state,
          isSfdxPathValid: action.payload.pathIsValid,
        };
      }
      return state;
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

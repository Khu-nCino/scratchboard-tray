import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { State } from ".";
import { validateSfdxPath } from "../api/sfdx";

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
  }
}

type SettingsAction = SetThemeAction | ToggleThemeAction | SetSfdxPath | SetSfdxPathValidity;

export function setTheme(theme: UITheme): SetThemeAction {
  return {
    type: "SET_THEME",
    payload: {
      theme
    }
  };
}

export function toggleTheme(): ToggleThemeAction {
  return {
    type: "TOGGLE_THEME"
  };
}

export function setSfdxPath(sfdxPath: string): ThunkReturn<Promise<boolean>> {
  return async (dispatch) => {
    dispatch({
      type: "SET_SFDX_PATH",
      payload: {
        sfdxPath
      }
    });

    const pathIsValid = await validateSfdxPath(sfdxPath);
    dispatch({
      type: "SET_SFDX_PATH_VALIDITY",
      payload: {
        sfdxPath,
        pathIsValid
      }
    });

    return pathIsValid;
  }
}

export type UITheme = "light" | "dark";

interface SettingsState {
  sfdxPath: string;
  isSfdxPathValid?: boolean;
  theme: UITheme;
}

const defaultState: SettingsState = {
  sfdxPath: "",
  theme: "dark"
};

export function settingsReducer(
  state: SettingsState = defaultState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload.theme
      };
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark"
      };
    case "SET_SFDX_PATH":
      return {
        ...state,
        sfdxPath: action.payload.sfdxPath
      };
    case "SET_SFDX_PATH_VALIDITY":
      if (state.sfdxPath === action.payload.sfdxPath) {
        return {
          ...state,
          isSfdxPathValid: action.payload.pathIsValid
        }
      }
      return state;
    default: {
      return state;
    }
  }
}

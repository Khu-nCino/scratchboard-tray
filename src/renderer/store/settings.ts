import { Action } from "redux";

interface SetThemeAction extends Action<"setTheme"> {
  payload: {
    theme: UITheme;
  };
}

interface ToggleThemeAction extends Action<"toggleTheme"> {}

interface SetSfdxPath extends Action<"setSfdxPath"> {
  payload: {
    sfdxPath: string;
  };
}

type SettingsAction = SetThemeAction | ToggleThemeAction | SetSfdxPath;

export function setTheme(theme: UITheme): SetThemeAction {
  return {
    type: "setTheme",
    payload: {
      theme
    }
  };
}

export function toggleTheme(): ToggleThemeAction {
  return {
    type: "toggleTheme"
  };
}

export function setSfdxPath(sfdxPath: string): SetSfdxPath {
  return {
    type: "setSfdxPath",
    payload: {
      sfdxPath
    }
  };
}

export type UITheme = "light" | "dark";

interface SettingsState {
  sfdxPath: string;
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
    case "setTheme":
      return {
        ...state,
        theme: action.payload.theme
      };
    case "toggleTheme":
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark"
      };
    case "setSfdxPath":
      return {
        ...state,
        sfdxPath: action.payload.sfdxPath
      };
    default: {
      return state;
    }
  }
}

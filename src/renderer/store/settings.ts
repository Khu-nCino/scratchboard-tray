import { Action } from "redux";

interface SetThemeAction extends Action<"setTheme"> {
  payload: {
    theme: UITheme;
  };
}

interface SetSfdxPath extends Action<"setSfdxPath"> {
  payload: {
    sfdxPath: string;
  }
}

type SettingsAction = SetThemeAction | SetSfdxPath;

export function setTheme(theme: UITheme): SetThemeAction {
  return {
    type: "setTheme",
    payload: {
      theme
    }
  };
}

export function setSfdxPath(sfdxPath: string): SetSfdxPath {
  return {
    type: 'setSfdxPath',
    payload: {
      sfdxPath
    }
  }
}

type UITheme = "light" | "dark";

interface SettingsState {
  sfdxPath: string;
  theme: UITheme;
}

const defaultState: SettingsState = {
  sfdxPath: '',
  theme: 'dark'
}

export function settingsReducer(state: SettingsState = defaultState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'setSfdxPath':
      return {
        ...state,
        sfdxPath: action.payload.sfdxPath
      };
    case 'setTheme':
      return {
        ...state,
        theme: action.payload.theme
      }
    default: {
      return state;
    }
  }
}

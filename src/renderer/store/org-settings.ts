import { Action } from "redux";

// Actions
type OrgSettingsAction = SetNicknameAction | SetProjectDirectoryAction;

interface SetNicknameAction extends Action<"SET_NICKNAME"> {
  payload: { username: string; nickname: string };
}

interface SetProjectDirectoryAction extends Action<"SET_PROJECT_DIRECTORY"> {
  payload: { username: string; projectDir: string };
}

export function setNicknameAction(
  username: string,
  nickname: string
): SetNicknameAction {
  return {
    type: "SET_NICKNAME",
    payload: { username, nickname }
  };
}

export function setProjectDirectoryAction(
  username: string,
  projectDir: string
): SetProjectDirectoryAction {
  return {
    type: "SET_PROJECT_DIRECTORY",
    payload: { username, projectDir }
  };
}

// State
interface OrgSettings {
  nickname?: string;
  projectDirectory?: string;
}

export type OrgSettingsState = Record<string, OrgSettings>;

// Reducer
export function orgSettingsReducer(
  state: OrgSettingsState = {},
  action: OrgSettingsAction
): OrgSettingsState {
  switch (action.type) {
    case "SET_NICKNAME": {
      const { username, nickname } = action.payload;

      return {
        ...state,
        [username]: {
          ...state[username],
          nickname
        }
      };
    }
    case "SET_PROJECT_DIRECTORY": {
      const { username, projectDir } = action.payload;

      return {
        ...state,
        [username]: {
          ...state[username],
          projectDirectory: projectDir
        }
      };
    }
    default: {
      return state;
    }
  }
}

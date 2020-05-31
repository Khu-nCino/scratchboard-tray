import { clipboard, ipcRenderer as ipc } from "electron";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";

import { SalesforceOrg, BaseOrg, ScratchOrg, SharedOrg } from "renderer/api/SalesforceOrg";
import { MessagesAction, createToast, createErrorToast } from "./messages";
import { State } from ".";
import { manager } from "renderer/api/core/OrgManager";
import { IpcRendererEvent } from "common/IpcEvent";

type ThunkResult<R> = ThunkAction<R, State, undefined, OrgAction | MessagesAction>;

// Actions
type OrgAction = OrgListChanges | AliasSetAction | SetPendingAction;

interface OrgListChanges extends Action<"ORG_LIST_CHANGES"> {
  payload: {
    changed: SalesforceOrg[];
    removed: string[];
  };
}

interface AliasSetAction extends Action<"ALIAS_SET_ACTION"> {
  payload: {
    username: string;
    alias: string;
  };
}

interface SetPendingAction extends Action<"SET_PENDING_ACTION"> {
  payload: {
    username: string;
    pendingAction: boolean;
  };
}

export function orgListChanged(changed: SalesforceOrg[], removed: string[]): OrgListChanges {
  return {
    type: "ORG_LIST_CHANGES",
    payload: {
      changed,
      removed,
    },
  };
}

export function openOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));
      ipc.send(IpcRendererEvent.OPEN_EXTERNAL, await manager.getFrontDoor(username));
    } catch (error) {
      dispatch(createErrorToast("There was an error opening your org 😞", error));
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function copyFrontDoor(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      const url = await manager.getFrontDoor(username);
      clipboard.writeText(url, "clipboard");
      dispatch(createToast("The front door is copied to your clipboard.", "success"));
    } catch (error) {
      dispatch(createErrorToast("There was an error copying your front door 😞", error));
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function logoutOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      await manager.logoutOrg(username);
      dispatch(orgListChanged([], [username]));

      dispatch(createToast("Successfully logged out of org.", "success"));
    } catch (error) {
      createErrorToast("There was an error logging out of your org 😞", error);
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function deleteOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      await manager.deleteScratchOrg(username);
      dispatch(orgListChanged([], [username]));

      dispatch(createToast("Successfully deleted org.", "success"));
    } catch (error) {
      dispatch(createErrorToast("There was an error deleting your org 😞", error));
    }
  };
}

export function setAliasAction(username: string, newAlias: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      await manager.setAlias(username, newAlias);

      dispatch({
        type: "ALIAS_SET_ACTION",
        payload: {
          username,
          alias: newAlias,
        },
      });
    } catch (error) {
      dispatch(createErrorToast("There was an error setting your alias 😞", error));
    }
  };
}

// Local Actions
function setPendingAction(username: string, pendingAction: boolean): SetPendingAction {
  return {
    type: "SET_PENDING_ACTION",
    payload: {
      username,
      pendingAction,
    },
  };
}

// State
export interface OrgDataState {
  pendingAction: boolean;
}

export interface OrgData<T extends BaseOrg> {
  description: T;
  state: OrgDataState;
}

export interface OrgsState {
  orgList: OrgData<SalesforceOrg>[];
}

const defaultOrgsState: OrgsState = {
  orgList: [],
};

const defaultOrgDataState: OrgDataState = {
  pendingAction: false,
};

// Reducers
export function orgsReducer(state: OrgsState = defaultOrgsState, action: OrgAction): OrgsState {
  switch (action.type) {
    case "ORG_LIST_CHANGES": {
      const { changed, removed } = action.payload;

      if (changed.length === 0 && removed.length === 0) {
        return state;
      }

      const prevUsernameSet = state.orgList.reduce((acc, org) => {
        acc.add(org.description.username);
        return acc;
      }, new Set<string>());

      const removedUsernameSet = removed.reduce((acc, x) => {
        acc.add(x);
        return acc;
      }, new Set<string>());

      const addedOrgs = changed.reduce<Record<string, SalesforceOrg>>((acc, org) => {
        acc[org.username] = org;
        return acc;
      }, {});

      const carryOver: OrgData<SalesforceOrg>[] = state.orgList
        .filter((org) => !removedUsernameSet.has(org.description.username))
        .map((org) => {
          const username = org.description.username;
          if (username in addedOrgs) {
            return {
              ...org,
              description: addedOrgs[username],
            };
          }
          return org;
        });

      const netNew: OrgData<SalesforceOrg>[] = changed
        .filter((org) => !prevUsernameSet.has(org.username))
        .map((org) => ({
          description: org,
          state: defaultOrgDataState,
        }));

      return {
        ...state,
        orgList: [...netNew, ...carryOver],
      };
    }
    case "ALIAS_SET_ACTION": {
      const { alias, username } = action.payload;

      const orgList = state.orgList.map((original) => {
        if (original.description.username === username) {
          return {
            ...original,
            description: {
              ...original.description,
              alias,
            },
          };
        }
        if (original.description.alias === alias) {
          return {
            ...original,
            description: {
              ...original.description,
              alias: "",
            },
          };
        }
        return original;
      });

      return {
        ...state,
        orgList,
      };
    }
    case "SET_PENDING_ACTION":
      return {
        ...state,
        orgList: state.orgList.map((org) =>
          org.description.username !== action.payload.username ||
          org.state.pendingAction === action.payload.pendingAction
            ? org
            : {
                ...org,
                state: {
                  ...org.state,
                  pendingAction: action.payload.pendingAction,
                },
              }
        ),
      };
    default:
      return state;
  }
}

// Selectors
export function selectScratchOrgs(state: OrgsState): OrgData<ScratchOrg>[] {
  return state.orgList.filter(isScratchOrg).sort(orgCompare);
}

export function selectSharedOrgs(state: OrgsState): OrgData<SharedOrg>[] {
  return state.orgList.filter(isSharedOrg).sort(orgCompare);
}

export function selectOrgDescriptions(state: OrgsState): SalesforceOrg[] {
  return state.orgList.map(({ description }) => description);
}

function isScratchOrg(org: OrgData<SalesforceOrg>): org is OrgData<ScratchOrg> {
  return org.description.isScratchOrg;
}

function isSharedOrg(org: OrgData<SalesforceOrg>): org is OrgData<SharedOrg> {
  return !org.description.isScratchOrg;
}

function orgCompare(a: OrgData<SalesforceOrg>, b: OrgData<SalesforceOrg>): number {
  return a.description.username.localeCompare(b.description.username);
}

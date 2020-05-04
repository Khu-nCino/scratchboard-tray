import { clipboard } from "electron";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";

import {
  listOrgs,
  openOrg,
  deleteOrg,
  frontDoorUrlApi,
  setAlias,
  SalesforceOrg,
  logoutOrg,
  BaseOrg,
  ScratchOrg,
  NonScratchOrg,
} from "renderer/api/sfdx";
import { MessagesAction, createToast, createErrorToast } from "./messages";
import { State } from ".";

type ThunkResult<R> = ThunkAction<
  R,
  State,
  undefined,
  OrgAction | MessagesAction
>;

// Actions
type OrgAction =
  | ListOrgsPending
  | ListOrgsFulfilled
  | ListOrgsRejected
  | ListOrgsSfdxPathInvalid
  | RemoveOrgListing
  | AliasSetAction
  | SetPendingAction;

interface ListOrgsPending extends Action<"LIST_ORGS_PENDING"> {}

interface ListOrgsFulfilled extends Action<"LIST_ORGS_FULFILLED"> {
  payload: {
    orgList: SalesforceOrg[];
  };
}

interface ListOrgsRejected extends Action<"LIST_ORGS_REJECTED"> {}

interface ListOrgsSfdxPathInvalid
  extends Action<"LIST_ORGS_SFDX_PATH_INVALID"> {}

interface RemoveOrgListing extends Action<"REMOVE_ORG_LISTING"> {
  payload: {
    username: string;
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

export function listOrgsRequest(): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    if (!getState().settings.isSfdxPathValid) {
      dispatch({ type: "LIST_ORGS_SFDX_PATH_INVALID" });
      return;
    }

    dispatch({ type: "LIST_ORGS_PENDING" });

    try {
      const orgList = await listOrgs();
      dispatch({
        type: "LIST_ORGS_FULFILLED",
        payload: {
          orgList,
        },
      });
    } catch (error) {
      dispatch({ type: "LIST_ORGS_REJECTED" });
    }
  };
}

export function openOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));
      await openOrg(username);
    } catch (error) {
      dispatch(
        createErrorToast("There was an error opening your org 😞", error)
      );
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function copyFrontDoor(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      const url = await frontDoorUrlApi(username);
      clipboard.writeText(url, "clipboard");
      dispatch(
        createToast("The front door is copied to your clipboard.", "success")
      );
    } catch (error) {
      dispatch(
        createErrorToast("There was an error copying your front door 😞", error)
      );
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

export function logoutOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));

      await logoutOrg(username);
      dispatch(removeOrgListing(username));

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

      await deleteOrg(username);
      dispatch(removeOrgListing(username));

      dispatch(createToast("Successfully deleted org.", "success"));
    } catch (error) {
      dispatch(
        createErrorToast("There was an error deleting your org 😞", error)
      );
    }
  };
}

export function setAliasAction(
  username: string,
  alias: string
): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(setPendingAction(username, true));
      await setAlias(username, alias);

      dispatch({
        type: "ALIAS_SET_ACTION",
        payload: {
          username,
          alias,
        },
      });
    } catch (error) {
      dispatch(
        createErrorToast("There was an error setting your alias 😞", error)
      );
    } finally {
      dispatch(setPendingAction(username, false));
    }
  };
}

// Local Actions
function setPendingAction(
  username: string,
  pendingAction: boolean
): SetPendingAction {
  return {
    type: "SET_PENDING_ACTION",
    payload: {
      username,
      pendingAction,
    },
  };
}

function removeOrgListing(username: string): RemoveOrgListing {
  return {
    type: "REMOVE_ORG_LISTING",
    payload: {
      username,
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

type OrgListStatus =
  | "initial"
  | "pending"
  | "loaded"
  | "failed"
  | "invalid_sfdx_path";

export interface OrgsState {
  orgListStatus: OrgListStatus;
  orgList: OrgData<SalesforceOrg>[];
}

const defaultOrgsState: OrgsState = {
  orgListStatus: "initial",
  orgList: [],
};

const defaultOrgDataState: OrgDataState = {
  pendingAction: false,
};

// Reducers
export function orgsReducer(
  state: OrgsState = defaultOrgsState,
  action: OrgAction
): OrgsState {
  switch (action.type) {
    case "LIST_ORGS_PENDING":
      return {
        ...state,
        orgListStatus: "pending",
      };
    case "LIST_ORGS_FULFILLED": {
      const orgStates: Record<string, OrgDataState> =
        state?.orgList?.reduce<Record<string, OrgDataState>>((acc, org) => {
          acc[org.description.username] = org.state;
          return acc;
        }, {}) ?? {};

      const orgList: OrgData<SalesforceOrg>[] = action.payload.orgList.map(
        (org) => ({
          description: org,
          state: orgStates[org.username] ?? defaultOrgDataState,
        })
      );

      return {
        ...state,
        orgListStatus: "loaded",
        orgList,
      };
    }
    case "LIST_ORGS_REJECTED":
      return {
        ...state,
        orgListStatus: "failed",
      };
    case "LIST_ORGS_SFDX_PATH_INVALID":
      return {
        ...state,
        orgListStatus: "invalid_sfdx_path",
      };
    case "REMOVE_ORG_LISTING": {
      const orgList = state.orgList.filter(
        (org) => org.description.username !== action.payload.username
      );

      return {
        ...state,
        orgList,
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
  return state.orgList.filter((org) => org.description.isScratchOrg) as OrgData<
    ScratchOrg
  >[];
}

export function selectSharedOrgs(state: OrgsState): OrgData<NonScratchOrg>[] {
  return state.orgList.filter(
    (org) => !org.description.isScratchOrg
  ) as OrgData<NonScratchOrg>[];
}

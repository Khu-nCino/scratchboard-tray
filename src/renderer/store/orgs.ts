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
} from "../api/sfdx";
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
  | AliasSetAction;

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
      await openOrg(username);
    } catch (error) {
      dispatch(
        createErrorToast(`There was an error opening your org 😞`, error)
      );
    }
  };
}

export function copyFrontDoor(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      const url = await frontDoorUrlApi(username);
      clipboard.writeText(url, "clipboard");
      dispatch(
        createToast("The front door is copied to your clipboard.", "success")
      );
    } catch (error) {
      dispatch(
        createErrorToast(`There was an error copying your front door 😞`, error)
      );
    }
  };
}

export function deleteOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      await deleteOrg(username);
      dispatch({
        type: "REMOVE_ORG_LISTING",
        payload: { username },
      });

      dispatch(createToast(`Successfully deleted org.`, "success"));
    } catch (error) {
      dispatch(
        createErrorToast(`There was an error deleting your org 😞`, error)
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
        createErrorToast(`There was an error setting your alias 😞`, error)
      );
    }
  };
}

// State
type OrgListStatus =
  | "initial"
  | "pending"
  | "loaded"
  | "failed"
  | "invalid_sfdx_path";

export interface OrgsState {
  orgListStatus: OrgListStatus;
  orgList: SalesforceOrg[];
}

function createDefaultOrgsState(): OrgsState {
  return {
    orgListStatus: "initial",
    orgList: [],
  };
}

// Reducers
export function orgsReducer(
  state: OrgsState = createDefaultOrgsState(),
  action: OrgAction
): OrgsState {
  switch (action.type) {
    case "LIST_ORGS_PENDING":
      return {
        ...state,
        orgListStatus: "pending",
      };
    case "LIST_ORGS_FULFILLED":
      return {
        ...state,
        orgListStatus: "loaded",
        orgList: action.payload.orgList,
      };
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
        ({ username }) => username !== action.payload.username
      );

      return {
        ...state,
        orgList,
      };
    }
    case "ALIAS_SET_ACTION": {
      const { alias, username } = action.payload;

      const orgList = state.orgList.map((original) => {
        if (original.username === username) {
          return {
            ...original,
            alias,
          };
        }
        if (original.alias === alias) {
          return {
            ...original,
            alias: "",
          };
        }
        return original;
      });

      return {
        ...state,
        orgList,
      };
    }
    default:
      return state;
  }
}

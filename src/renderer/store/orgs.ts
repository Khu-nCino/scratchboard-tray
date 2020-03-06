import { clipboard } from "electron";
import { Action } from "redux";
import { ThunkAction } from "redux-thunk";

import {
  ScratchOrg,
  listScratchOrgs,
  openOrg,
  deleteOrg,
  frontDoorUrlApi
} from "../api/sfdx";
import { JobsAction, createToast, createErrorToast } from "./jobs";
import { State } from ".";

type ThunkResult<R> = ThunkAction<R, State, undefined, OrgAction | JobsAction>;

// Actions
type OrgAction =
  | ListOrgsPending
  | ListOrgsFulfilled
  | ListOrgsRejected
  | ListOrgsSfdxPathInvalid
  | RemoveOrgListing;

interface ListOrgsPending extends Action<"LIST_ORGS_PENDING"> {}

interface ListOrgsFulfilled extends Action<"LIST_ORGS_FULFILLED"> {
  payload: {
    scratchOrgs: ScratchOrg[];
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

export function listOrgsRequest(): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    if (!getState().settings.isSfdxPathValid) {
      dispatch({ type: "LIST_ORGS_SFDX_PATH_INVALID" });
      return;
    }

    dispatch({ type: "LIST_ORGS_PENDING" });

    try {
      const scratchOrgs = await listScratchOrgs();
      dispatch({
        type: "LIST_ORGS_FULFILLED",
        payload: { scratchOrgs }
      });
    } catch (error) {
      console.log(error);
      dispatch(
        createErrorToast(
          "There was an error listing your scratch orgs 😞",
          error
        )
      );
      dispatch({ type: "LIST_ORGS_REJECTED" });
    }
  };
}

export function openOrgAction(username: string): ThunkResult<Promise<void>> {
  return async dispatch => {
    try {
      await openOrg(username);
    } catch (error) {
      console.error(error);
      dispatch(
        createErrorToast(`There was an error opening your org 😞`, error)
      );
    }
  };
}

export function copyFrontDoor(username: string): ThunkResult<Promise<void>> {
  return async dispatch => {
    try {
      const url = await frontDoorUrlApi(username);
      clipboard.writeText(url, "clipboard");
      dispatch(
        createToast(
          "The frontdoor url has been copied to your clipboard!",
          "success"
        )
      );
    } catch (error) {
      console.error(error);
      dispatch(
        createErrorToast(`There was an error opening your org 😞`, error)
      );
    }
  };
}

export function deleteOrgAction(username: string): ThunkResult<Promise<void>> {
  return async dispatch => {
    try {
      await deleteOrg(username);
      dispatch({
        type: "REMOVE_ORG_LISTING",
        payload: { username }
      });

      dispatch(createToast(`Successfully deleted org.`, "success"));
    } catch (error) {
      console.error(error);
      dispatch(
        createErrorToast(`There was an error deleting your org 😞`, error)
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
  orgList: ScratchOrg[];
}

function createDefaultOrgsState(): OrgsState {
  return {
    orgListStatus: "initial",
    orgList: []
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
        orgListStatus: "pending"
      };
    case "LIST_ORGS_FULFILLED":
      return {
        ...state,
        orgListStatus: "loaded",
        orgList: action.payload.scratchOrgs
      };
    case "LIST_ORGS_REJECTED":
      return {
        ...state,
        orgListStatus: "failed"
      };
    case "LIST_ORGS_SFDX_PATH_INVALID":
      return {
        ...state,
        orgListStatus: "invalid_sfdx_path"
      };
    case "REMOVE_ORG_LISTING": {
      const orgList = [...state.orgList];
      const indexToRemove = orgList.findIndex(
        ({ username }) => username === action.payload.username
      );

      if (indexToRemove < 0) {
        return state;
      }

      orgList.splice(indexToRemove, 1);

      return {
        ...state,
        orgList
      };
    }
    default:
      return state;
  }
}

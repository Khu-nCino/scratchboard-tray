import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { ScratchOrg, listScratchOrgs, openOrg, deleteOrg } from "../api/sfdx";
import { JobsAction, createToast } from "./jobs";
import { State } from ".";

type ThunkResult<R> = ThunkAction<R, State, undefined, OrgAction | JobsAction>;

// Actions
type OrgAction =
  | ListOrgsRequest
  | ListOrgsPending
  | ListOrgsFulfilled
  | ListOrgsRejected
  | RemoveOrgListing;

interface ListOrgsRequest extends Action<"LIST_ORGS"> {
  payload: Promise<ScratchOrg[]>;
}

interface ListOrgsPending extends Action<"LIST_ORGS_PENDING"> {}

interface ListOrgsFulfilled extends Action<"LIST_ORGS_FULFILLED"> {
  payload: ScratchOrg[];
}

interface ListOrgsRejected extends Action<"LIST_ORGS_REJECTED"> {
  payload: string;
  error: true;
}

interface RemoveOrgListing extends Action<"REMOVE_ORG_LISTING"> {
  payload: {
    username: string;
  };
}

export function openOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      await openOrg(username);
    } catch {
      dispatch(createToast(
        `Failed to open org ${username}`,
        "danger"
      ));
    }
  }
}

export function deleteOrgAction(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      await deleteOrg(username);
      dispatch({
        type: "REMOVE_ORG_LISTING",
        payload: {
          username
        }
      });

      dispatch(createToast(
        `${username} was successfully deleted`,
        "success"
      ));
    } catch (error) {
      dispatch(createToast(
        `Failed to delete ${username}`,
        "danger"
      ));
    }
  };
}

export function listOrgsRequest(): ListOrgsRequest {
  return {
    type: "LIST_ORGS",
    payload: listScratchOrgs()
  };
}

// State
export type OrgsState =
  | OrgsInitialState
  | OrgsFulfilledState
  | OrgsPendingState
  | OrgsRejectedState;

interface OrgsInitialState {
  type: "INITIAL";
}

interface OrgsFulfilledState {
  type: "FULFILLED";
  orgList: ScratchOrg[];
}

interface OrgsPendingState {
  type: "PENDING";
}

interface OrgsRejectedState {
  type: "REJECTED";
  reason: string;
}

function createDefaultOrgsState(): OrgsInitialState {
  return { type: "INITIAL" };
}

// Reducers
export function orgsReducer(
  state: OrgsState = createDefaultOrgsState(),
  action: OrgAction
): OrgsState {
  switch (action.type) {
    case "LIST_ORGS_PENDING":
      return {
        type: "PENDING"
      };
    case "LIST_ORGS_FULFILLED":
      return {
        type: "FULFILLED",
        orgList: action.payload
      };
    case "LIST_ORGS_REJECTED":
      return {
        type: "REJECTED",
        reason: action.payload
      };
    case "REMOVE_ORG_LISTING": {
      if (state.type === "FULFILLED") {
        const orgList = [...state.orgList];
        const indexToRemove = orgList.findIndex(
          ({ username }) => username === action.payload.username
        );

        orgList.splice(indexToRemove, 1);

        return {
          ...state,
          orgList
        }
      } else {
        return state;
      }
    }
    default:
      return state;
  }
}

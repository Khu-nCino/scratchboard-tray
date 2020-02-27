import { Action, AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { ScratchOrg, listScratchOrgs, openOrg } from "../api/sfdx";
import { State } from ".";

type ThunkResult<R> = ThunkAction<R, State, undefined, AnyAction>;

// Actions
type ListOrgsAction =
  | ListOrgsRequest
  | ListOrgsPending
  | ListOrgsFulfilled
  | ListOrgsRejected;

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

export function openOrgAction(username: string): ThunkResult<Promise<void>> {
  return async dispatch => {
    await openOrg(username);
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
  orgList?: ScratchOrg[];
}

interface OrgsRejectedState {
  type: "REJECTED";
  reason: string;
  orgList?: ScratchOrg[];
}

function createDefaultOrgsState(): OrgsInitialState {
  return { type: "INITIAL" };
}

// Reducers
export function orgsReducer(
  state: OrgsState = createDefaultOrgsState(),
  orgsAction: ListOrgsAction
): OrgsState {
  switch (orgsAction.type) {
    case "LIST_ORGS_PENDING":
      return {
        ...state,
        type: "PENDING"
      };
    case "LIST_ORGS_FULFILLED":
      return {
        type: "FULFILLED",
        orgList: orgsAction.payload
      };
    case "LIST_ORGS_REJECTED":
      return {
        ...state,
        type: "REJECTED",
        reason: orgsAction.payload
      };
    default:
      return state;
  }
}

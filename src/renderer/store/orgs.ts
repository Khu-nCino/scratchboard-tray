import { ScratchOrg, listScratchOrgs } from "../api/sfdx";

// Actions
type ListOrgsAction =
  | ListOrgsRequest
  | ListOrgsPending
  | ListOrgsFulfilled
  | ListOrgsRejected;

interface ListOrgsRequest {
  type: "LIST_ORGS";
  payload: Promise<ScratchOrg[]>;
}

interface ListOrgsPending {
  type: "LIST_ORGS_PENDING";
}

interface ListOrgsFulfilled {
  type: "LIST_ORGS_FULFILLED";
  payload: ScratchOrg[];
}

interface ListOrgsRejected {
  type: "LIST_ORGS_REJECTED";
  payload: string;
  error: true;
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

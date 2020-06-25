import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { State } from ".";
import { OrgListChanges } from "./orgs";
import {
  packageManager,
  SubscriberPackageVersion,
  AuthorityPackageVersion,
} from "renderer/api/core/PackageManager";

// Actions
type PackagesAction =
  | SetPackageAuthorityUsernameAction
  | SetInstalledPackageVersionsAction
  | SetOrgActionStatusAction
  | OrgListChanges;
type ThunkResult<R> = ThunkAction<R, State, undefined, PackagesAction>;

interface SetPackageAuthorityUsernameAction extends Action<"SET_PACKAGE_AUTHORITY_USERNAME"> {
  payload: {
    username: string;
  };
}

interface SetOrgActionStatusAction extends Action<"SET_ORG_ACTION_STATUS"> {
  payload: {
    username: string;
    status: OrgActionStatus;
  };
}

interface SetInstalledPackageVersionsAction extends Action<"SET_INSTALLED_PACKAGE_VERSIONS"> {
  payload: {
    username: string;
    versions: SubscriberPackageVersion[];
    timestamp: number;
  };
}

export function setPackageAuthorityUsername(
  username: string
): SetPackageAuthorityUsernameAction {
  return {
    type: "SET_PACKAGE_AUTHORITY_USERNAME",
    payload: {
      username,
    },
  };
}

function setOrgActionStatus(
  username: string,
  status: OrgActionStatus
): SetOrgActionStatusAction {
  return {
    type: "SET_ORG_ACTION_STATUS",
    payload: {
      username,
      status,
    },
  };
}

function setInstalledPackageVersions(
  username: string,
  versions: SubscriberPackageVersion[],
  timestamp: number
): SetInstalledPackageVersionsAction {
  return {
    type: "SET_INSTALLED_PACKAGE_VERSIONS",
    payload: {
      username,
      versions,
      timestamp,
    },
  };
}

export function checkInstalledPackages(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    dispatch(setOrgActionStatus(username, "pending"));

    try {
      const installedPackages = await packageManager.listSubscriberPackageVersions(username);
      dispatch(setInstalledPackageVersions(username, installedPackages, Date.now()));
    } finally {
      dispatch(setOrgActionStatus(username, "ideal"));
    }
  };
}

// State
export type OrgActionStatus = "ideal" | "pending";

export interface OrgPackageState {
  readonly actionStatus: OrgActionStatus;
  readonly lastInstalledVersionsCheck?: number;
  readonly installedVersions: SubscriberPackageVersion[]; // <namespace prefix, version>
}

interface PackageInfo {
  readonly latestVersionName: string;
  readonly latestVersionCheck: number;

  readonly versions: Record<string, AuthorityPackageVersion>;
}

export interface PackagesState {
  readonly authorityUsername: string;

  readonly orgInfo: Record<string, OrgPackageState>; // <username, packageState>
  readonly packageInfo: Record<string, PackageInfo>; // <namespace prefix, >
}

const defaultOrgPackageState: OrgPackageState = {
  actionStatus: "ideal",
  installedVersions: [],
};

export const defaultPackagesState: PackagesState = {
  authorityUsername: "",
  orgInfo: {},
  packageInfo: {},
};

export function packagesReducer(
  state: PackagesState = defaultPackagesState,
  action: PackagesAction
): PackagesState {
  switch (action.type) {
    case "SET_PACKAGE_AUTHORITY_USERNAME":
      return {
        ...state,
        authorityUsername: action.payload.username,
      };
    // case "ORG_LIST_CHANGES":

    case "SET_ORG_ACTION_STATUS":
      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [action.payload.username]: {
            ...(state.orgInfo[action.payload.username] ?? defaultOrgPackageState),
            actionStatus: action.payload.status,
          },
        },
      };
    case "SET_INSTALLED_PACKAGE_VERSIONS":
      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [action.payload.username]: {
            ...(state.orgInfo[action.payload.username] ?? defaultOrgPackageState),
            lastInstalledVersionsCheck: action.payload.timestamp,
            installedVersions: action.payload.versions,
          }
        },
      };
    default:
      return state;
  }
}

export function selectOrgInfo(state: State, username: string): OrgPackageState {
  return state.packages.orgInfo[username] ?? defaultOrgPackageState;
}
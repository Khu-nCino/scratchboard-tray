import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { State } from ".";
import { packageManager } from "renderer/api/core/PackageManager";

// Actions
type PackagesAction = SetPackageAuthorityUsernameAction;
type ThunkResult<R> = ThunkAction<R, State, undefined, PackagesAction>;

interface SetPackageAuthorityUsernameAction extends Action<"SET_PACKAGE_AUTHORITY_USERNAME"> {
  payload: {
    username: string;
  };
}

export function setPackageAuthorityUsernameAction(
  username: string
): SetPackageAuthorityUsernameAction {
  return {
    type: "SET_PACKAGE_AUTHORITY_USERNAME",
    payload: {
      username,
    },
  };
}

function checkInstalledPackages(username: string): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    const installedPackages = await packageManager.listSubscriberPackageVersions(username);
  };
}

// State
interface OrgPackageState {
  installedVersions: Record<string, string>; // <namespace prefix, version>
}

interface PackageInfo {
  readonly [version: string]: {
    readonly password: string;
  };
}

export interface PackagesState {
  readonly authorityUsername: string;

  readonly orgInfo: Record<string, OrgPackageState>; // <username, packageState>
  readonly packageInfo: Record<string, PackageInfo>; // <namespace prefix, >
}

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
    default:
      return state;
  }
}

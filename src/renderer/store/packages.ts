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
  | SetLatestPackageVersionsAction
  | SetPackageActionStatusAction
  | OrgListChanges
  | TogglePendingPackageUpgrade
  | ToggleAllPendingPackageUpgrade;

type ThunkResult<R> = ThunkAction<R, State, undefined, PackagesAction>;

interface SetPackageAuthorityUsernameAction extends Action<"SET_PACKAGE_AUTHORITY_USERNAME"> {
  payload: {
    username: string;
  };
}

interface SetPackageActionStatusAction extends Action<"SET_PACKAGE_ACTION_STATUS"> {
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

interface SetLatestPackageVersionsAction extends Action<"SET_LATEST_PACKAGE_VERSIONS"> {
  payload: {
    versions: AuthorityPackageVersion[];
    timestamp: number;
  };
}

interface TogglePendingPackageUpgrade extends Action<"TOGGLE_PENDING_PACKAGE_UPGRADE"> {
  payload: {
    username: string;
    namespace: string;
  };
}

interface ToggleAllPendingPackageUpgrade extends Action<"TOGGLE_ALL_PENDING_PACKAGE_UPGRADE"> {
  payload: {
    username: string;
  };
}

export function setPackageAuthorityUsername(username: string): SetPackageAuthorityUsernameAction {
  return {
    type: "SET_PACKAGE_AUTHORITY_USERNAME",
    payload: {
      username,
    },
  };
}

function setPackageActionStatus(
  username: string,
  status: OrgActionStatus
): SetPackageActionStatusAction {
  return {
    type: "SET_PACKAGE_ACTION_STATUS",
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

function setLatestPackageVersions(
  versions: AuthorityPackageVersion[],
  timestamp: number
): SetLatestPackageVersionsAction {
  return {
    type: "SET_LATEST_PACKAGE_VERSIONS",
    payload: {
      versions,
      timestamp,
    },
  };
}

export function togglePendingPackageUpgrade(
  username: string,
  namespace: string
): TogglePendingPackageUpgrade {
  return {
    type: "TOGGLE_PENDING_PACKAGE_UPGRADE",
    payload: {
      username,
      namespace,
    },
  };
}

export function toggleAllPendingPackageUpgrade(username: string): ToggleAllPendingPackageUpgrade {
  return {
    type: "TOGGLE_ALL_PENDING_PACKAGE_UPGRADE",
    payload: {
      username,
    },
  };
}

export function checkInstalledPackages(username: string): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const { authorityUsername } = getState().packages;

    dispatch(setPackageActionStatus(username, "pending_subscriber"));

    try {
      const installedPackages = await packageManager.listSubscriberPackageVersions(username);
      dispatch(setInstalledPackageVersions(username, installedPackages, Date.now()));
      dispatch(setPackageActionStatus(username, "pending_authority"));

      const namespaces = installedPackages.map((installedPackage) => installedPackage.namespace);
      const latestPackageVersions = await packageManager.getLatestAvailablePackageVersions(
        authorityUsername,
        namespaces
      );

      dispatch(setPackageActionStatus(username, "pending_details"));
      const latestPackageDetails = await packageManager.getAuthorityPackageDetails(
        authorityUsername,
        latestPackageVersions
      );

      dispatch(setLatestPackageVersions(latestPackageDetails, Date.now()));
    } finally {
      dispatch(setPackageActionStatus(username, "ideal"));
    }
  };
}

// State
export type OrgActionStatus =
  | "initial"
  | "ideal"
  | "pending_subscriber"
  | "pending_authority"
  | "pending_details";

interface OrgPackage {
  installedVersion: string;
  pendingUpgrade: boolean;
}

export interface OrgPackageState {
  readonly actionStatus: OrgActionStatus;
  readonly lastInstalledVersionsCheck?: number;
  readonly packages: Record<string, OrgPackage>;
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
  actionStatus: "initial",
  packages: {},
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

    case "SET_PACKAGE_ACTION_STATUS":
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
            packages: action.payload.versions.reduce<Record<string, OrgPackage>>((acc, version) => {
              acc[version.namespace] = { installedVersion: version.versionName, pendingUpgrade: true };
              return acc;
            }, {}),
          },
        },
      };
    case "TOGGLE_PENDING_PACKAGE_UPGRADE": {
      const { username, namespace } = action.payload;

      const currentOrgInfo = state.orgInfo[username];
      const currentPackageInfo = currentOrgInfo?.packages[namespace];
      if (currentPackageInfo === undefined) {
        return state;
      }

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...currentOrgInfo,
            packages: {
              ...currentOrgInfo.packages,
              [namespace]: {
                ...currentPackageInfo,
                pendingUpgrade: !currentPackageInfo.pendingUpgrade,
              },
            },
          },
        },
      };
    }
    case "TOGGLE_ALL_PENDING_PACKAGE_UPGRADE": {
      const { username } = action.payload;
      const currentOrgInfo = state.orgInfo[username];
      if (currentOrgInfo === undefined) {
        return state;
      }

      const installedPackageList = Object.entries(currentOrgInfo.packages);
      const nextValue = !installedPackageList
        .filter(([namespace,]) => isUpgradeAvailable(state, username, namespace))
        .every(([,{ pendingUpgrade }]) => pendingUpgrade);

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...currentOrgInfo,
            packages: Object.entries(currentOrgInfo.packages).reduce<Record<string, OrgPackage>>((acc, [namespace, currentPackage]) => {
              acc[namespace] =
                nextValue === currentPackage.pendingUpgrade
                  ? currentPackage
                  : {
                      ...currentPackage,
                      pendingUpgrade: nextValue,
                    };
              return acc;
            }, {}),
          },
        },
      };
    }
    case "SET_LATEST_PACKAGE_VERSIONS":
      return {
        ...state,
        packageInfo: {
          ...state.packageInfo,
          ...action.payload.versions.reduce<Record<string, PackageInfo>>((acc, version) => {
            acc[version.namespace] = {
              latestVersionCheck: action.payload.timestamp,
              latestVersionName: version.versionName,
              versions: {
                ...(state.packageInfo[version.namespace]?.versions ?? {}),
                [version.versionName]: version,
              },
            };
            return acc;
          }, {}),
        },
      };
    default:
      return state;
  }
}

export function selectOrgInfo(state: State, username: string): OrgPackageState {
  return state.packages.orgInfo[username] ?? defaultOrgPackageState;
}

export function selectLatestPackageVersions(
  state: State,
  namespaces: string[]
): Record<string, SubscriberPackageVersion> {
  return namespaces.reduce<Record<string, SubscriberPackageVersion>>((acc, namespace) => {
    const packageInfo = state.packages.packageInfo[namespace];
    const packageVersion = packageInfo?.versions[packageInfo.latestVersionName];
    if (packageVersion !== undefined) {
      acc[namespace] = packageVersion;
    }

    return acc;
  }, {});
}

export function isUpgradeAvailable(state: PackagesState, username: string, namespace: string): boolean {
  const { orgInfo, packageInfo } = state;
  const installedVersion = orgInfo[username]?.packages[namespace]?.installedVersion;
  const latestVersion = packageInfo[namespace]?.latestVersionName;

  return installedVersion !== undefined && latestVersion !== undefined && installedVersion !== latestVersion;
}
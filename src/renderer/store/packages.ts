import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { groupBy2, delay } from "common/util";
import { State } from ".";
import { OrgListChanges } from "./orgs";
import {
  packageManager,
  SubscriberPackageVersion,
  AuthorityPackageVersion,
  PackageVersion,
  PackageInstallRequest,
} from "renderer/api/core/PackageManager";
import { createErrorToast, MessagesAction } from "./messages";

// Actions
type PackagesAction =
  | SetPackageAuthorityUsernameAction
  | SetInstalledPackageVersionsAction
  | SetPackageDetailsAction
  | SetLatestPackageVersionsAction
  | SetPackageActionStatusAction
  | OrgListChanges
  | TogglePendingPackageUpgrade
  | ToggleAllPendingPackageUpgrade
  | PackageInstallRequestStatusUpdate;

type ThunkResult<R> = ThunkAction<R, State, undefined, PackagesAction | MessagesAction>;

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

interface SetPackageDetailsAction extends Action<"SET_PACKAGE_DETAIL_ACTION"> {
  payload: {
    versions: Record<string, Record<string, AuthorityPackageVersion>>;
  };
}

interface SetLatestPackageVersionsAction extends Action<"SET_LATEST_PACKAGE_VERSIONS"> {
  payload: {
    versions: PackageVersion[];
    timestamp: number;
  };
}

interface TogglePendingPackageUpgrade extends Action<"TOGGLE_PENDING_PACKAGE_UPGRADE"> {
  payload: {
    username: string;
    packageId: string;
  };
}

interface ToggleAllPendingPackageUpgrade extends Action<"TOGGLE_ALL_PENDING_PACKAGE_UPGRADE"> {
  payload: {
    username: string;
  };
}

interface PackageInstallRequestStatusUpdate
  extends Action<"PACKAGE_INSTALL_REQUEST_STATUS_UPDATE"> {
  payload: {
    username: string;
    requests: PackageInstallRequest[];
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
  versions: PackageVersion[],
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

function setPackageDetails(
  versions: Record<string, Record<string, AuthorityPackageVersion>>
): SetPackageDetailsAction {
  return {
    type: "SET_PACKAGE_DETAIL_ACTION",
    payload: {
      versions,
    },
  };
}

export function togglePendingPackageUpgrade(
  username: string,
  packageId: string
): TogglePendingPackageUpgrade {
  return {
    type: "TOGGLE_PENDING_PACKAGE_UPGRADE",
    payload: {
      username,
      packageId,
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

function packageInstallRequestStatusUpdate(
  username: string,
  requests: PackageInstallRequest[]
): PackageInstallRequestStatusUpdate {
  return {
    type: "PACKAGE_INSTALL_REQUEST_STATUS_UPDATE",
    payload: {
      username,
      requests,
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

      const packageIds = installedPackages.map((installedPackage) => installedPackage.packageId);
      const latestPackageVersions = await packageManager.getLatestAvailablePackageVersions(
        authorityUsername,
        packageIds
      );

      dispatch(setPackageActionStatus(username, "pending_details"));
      const packageDetails = await packageManager.getAuthorityPackageDetails(authorityUsername, [
        ...installedPackages,
        ...latestPackageVersions,
      ]);

      const latestVersionSet = new Set<string>(
        latestPackageVersions.map(({ sortingVersion }) => sortingVersion)
      );

      const latestPackageDetails = packageDetails.filter((packageDetail) =>
        latestVersionSet.has(packageDetail.sortingVersion)
      );

      const packageDetailMap = groupBy2(packageDetails, "packageId", "versionName");

      dispatch(setLatestPackageVersions(latestPackageDetails, Date.now()));
      dispatch(setPackageDetails(packageDetailMap));
    } catch (error) {
      dispatch(createErrorToast("There was an error fetching you package data 🤔", error));
    } finally {
      dispatch(setPackageActionStatus(username, "ideal"));
    }
  };
}

export function installPackages(
  username: string,
  targets: AuthorityPackageVersion[]
): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      const requests = await packageManager.createPackagesInstallRequests(username, targets);
      dispatch(packageInstallRequestStatusUpdate(username, requests));
      dispatch(checkPackageInstallRequests(username, requests));
    } catch (error) {
      dispatch(createErrorToast("There was an error upgrading your packages", error));
    }
  };
}

function checkPackageInstallRequests(
  username: string,
  requests: PackageInstallRequest[]
): ThunkResult<Promise<void>> {
  return async (dispatch) => {
    try {
      const nextRequests = await packageManager.checkPackageInstallRequests(username, requests);
      const statusChange = nextRequests.some(
        (nextRequest, index) => nextRequest.status !== requests[index].status
      );
      const pendingRequests = nextRequests.filter(({ status }) => status === "pending");

      if (statusChange) {
        dispatch(packageInstallRequestStatusUpdate(username, nextRequests));
      }

      if (pendingRequests.length > 0) {
        await delay(10000);
        dispatch(checkPackageInstallRequests(username, pendingRequests));
      }
    } catch (error) {
      dispatch(createErrorToast("There was an error upgrading your packages", error));
    }
  };
}

// State
const targets = [
  "latest",
  "release"
] as const;

type PackageTarget = typeof targets[number];

export type OrgActionStatus =
  | "initial"
  | "ideal"
  | "pending_subscriber"
  | "pending_authority"
  | "pending_details";

interface OrgPackageInstallRequest {
  requests: PackageInstallRequest[];
  timestamp: number;
}

interface OrgPackage {
  readonly installedVersion: string;
  readonly isManaged: boolean;
  readonly upgradeSelected: boolean;
}

export interface OrgPackageState {
  readonly actionStatus: OrgActionStatus;
  readonly lastInstalledVersionsChecked?: number;
  readonly packages: Record<string, OrgPackage>;

  readonly target: PackageTarget;
  readonly installRequest?: OrgPackageInstallRequest;
}

interface PackageInfo {
  readonly latestVersionName: string;
  readonly latestVersionChecked: number;

  readonly versions: Record<string, AuthorityPackageVersion>;
}

export interface PackagesState {
  readonly authorityUsername: string;

  readonly orgInfo: Record<string, OrgPackageState>;
  readonly packageInfo: Record<string, PackageInfo>;
}

const defaultOrgPackageState: OrgPackageState = {
  actionStatus: "initial",
  packages: {},
  target: "latest",
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
            lastInstalledVersionsChecked: action.payload.timestamp,
            packages: Object.fromEntries(
              action.payload.versions.map((version) => [
                version.packageId,
                {
                  installedVersion: version.versionName,
                  isManaged: version.isManaged,
                  upgradeSelected: false,
                },
              ])
            ),
          },
        },
      };
    case "TOGGLE_PENDING_PACKAGE_UPGRADE": {
      const { username, packageId } = action.payload;

      const currentOrgInfo = state.orgInfo[username];
      const currentPackageInfo = currentOrgInfo?.packages[packageId];
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
              [packageId]: {
                ...currentPackageInfo,
                upgradeSelected: !currentPackageInfo.upgradeSelected,
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
        .filter(([packageId]) => isUpgradeAvailable(state, username, packageId))
        .every(([, { upgradeSelected: pendingUpgrade }]) => pendingUpgrade);

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...currentOrgInfo,
            packages: Object.fromEntries(
              Object.entries(currentOrgInfo.packages).map(([packageId, currentPackage]) => [
                packageId,
                nextValue === currentPackage.upgradeSelected
                  ? currentPackage
                  : {
                      ...currentPackage,
                      upgradeSelected: nextValue,
                    },
              ])
            ),
          },
        },
      };
    }
    case "SET_LATEST_PACKAGE_VERSIONS":
      return {
        ...state,
        packageInfo: {
          ...state.packageInfo,
          ...Object.fromEntries(
            action.payload.versions.map(({ packageId, versionName }) => [
              packageId,
              {
                latestVersionChecked: action.payload.timestamp,
                latestVersionName: versionName,
                versions: state.packageInfo[packageId]?.versions ?? {},
              },
            ])
          ),
        },
      };
    case "SET_PACKAGE_DETAIL_ACTION": {
      return {
        ...state,
        packageInfo: {
          ...state.packageInfo,
          ...Object.fromEntries(
            Object.entries(action.payload.versions).map(([packageId, versions]) => [
              packageId,
              {
                ...(state.packageInfo[packageId] ?? {}),
                versions: {
                  ...(state.packageInfo[packageId]?.versions ?? {}),
                  ...versions,
                },
              },
            ])
          ),
        },
      };
    }
    // case "PACKAGE_INSTALL_REQUEST_STATUS_UPDATE": {
    //   const { username, requests } = action.payload;
    //   const statusMap = new Map<string, boolean>(
    //     requests.map((request) => [request.packageVersion.packageId, request.status === "pending"])
    //   );

    //   const org = state.orgInfo[username];
    //   return {
    //     ...state,
    //     orgInfo: {
    //       ...state.orgInfo,
    //       [username]: {
    //         ...org,
    //         packages: Object.fromEntries(
    //           Object.entries(org.packages).map(([packageId, packageObj]) => {
    //             const pendingInstall = statusMap.get(packageId);

    //             return [
    //               packageId,
    //               pendingInstall === undefined || pendingInstall === packageObj.pendingInstall
    //                 ? packageObj
    //                 : {
    //                     ...packageObj,
    //                     pendingInstall,
    //                   },
    //             ];
    //           })
    //         ),
    //       },
    //     },
    //   };
    // }
    default:
      return state;
  }
}

export interface OrgPackageDetails extends OrgPackageState {
  readonly packages: Record<
    string,
    {
      installedVersionInfo?: AuthorityPackageVersion;
      latestVersionInfo?: AuthorityPackageVersion;
      upgradeAvailable: boolean;
      installedVersion: string;
      upgradeSelected: boolean;
      isManaged: boolean;
    }
  >;
}

export function selectOrgPackageDetails(state: PackagesState, username: string): OrgPackageDetails {
  const orgInfo = state.orgInfo[username];

  if (orgInfo === undefined) {
    return {
      ...defaultOrgPackageState,
      packages: {},
    };
  }

  return {
    ...orgInfo,
    packages: Object.fromEntries(
      Object.entries(orgInfo.packages).map(([packageId, info]) => {
        const packageInfo = state.packageInfo[packageId];
        const installedVersionInfo = packageInfo?.versions[info.installedVersion];
        const latestVersionInfo = packageInfo?.versions[packageInfo.latestVersionName];

        return [
          packageId,
          {
            ...info,
            installedVersionInfo,
            latestVersionInfo,
            upgradeAvailable:
              installedVersionInfo !== undefined && installedVersionInfo !== latestVersionInfo,
          },
        ];
      })
    ),
  };
}

export function isUpgradeAvailable(
  state: PackagesState,
  username: string,
  packageId: string
): boolean {
  const { orgInfo, packageInfo } = state;
  const installedVersion = orgInfo[username]?.packages[packageId]?.installedVersion;
  const latestVersion = packageInfo[packageId]?.latestVersionName;

  return (
    installedVersion !== undefined &&
    latestVersion !== undefined &&
    installedVersion !== latestVersion
  );
}

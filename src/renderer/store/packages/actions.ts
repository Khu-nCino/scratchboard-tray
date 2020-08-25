import { ThunkAction } from "redux-thunk";
import { State } from "..";
import { MessagesAction, createErrorToast } from "../messages";
import { OrgActionStatus, TargetType } from "./state";
import { AuthorityPackageVersion, packageManager } from "renderer/api/core/PackageManager";

export const SET_PACKAGE_AUTHORITY_USERNAME = "SET_PACKAGE_AUTHORITY_USERNAME";
export const SET_PACKAGE_ACTION_STATUS = "SET_PACKAGE_ACTION_STATUS";
export const SET_ORG_TARGET_TYPE = "SET_ORG_TARGET_TYPE";
export const SET_PACKAGE_DETAIL_ACTION = "SET_PACKAGE_DETAIL_ACTION";
export const TOGGLE_PENDING_PACKAGE_UPGRADE = "TOGGLE_PENDING_PACKAGE_UPGRADE";
export const TOGGLE_ALL_PENDING_PACKAGE_UPGRADE = "TOGGLE_ALL_PENDING_PACKAGE_UPGRADE";
export const PACKAGE_INSTALL_REQUEST_STATUS_UPDATE = "PACKAGE_INSTALL_REQUEST_STATUS_UPDATE";

export type PackagesAction =
  | ReturnType<typeof setPackageAuthorityUsername>
  | ReturnType<typeof setPackageDetails>
  | ReturnType<typeof setOrgTargetType>
  | ReturnType<typeof setPackageActionStatus>
  | ReturnType<typeof togglePendingPackageUpgrade>
  | ReturnType<typeof toggleAllPendingPackageUpgrade>;

type ThunkResult<R> = ThunkAction<R, State, undefined, PackagesAction | MessagesAction>;

interface PackageDetailsVersion {
  isManaged: boolean;
  targets: Record<string, AuthorityPackageVersion>;
}

export function setPackageAuthorityUsername(username: string) {
  return {
    type: SET_PACKAGE_AUTHORITY_USERNAME,
    payload: {
      username,
    },
  } as const;
}

function setPackageActionStatus(username: string, status: OrgActionStatus) {
  return {
    type: SET_PACKAGE_ACTION_STATUS,
    payload: {
      username,
      status,
    },
  } as const;
}

function setPackageDetails(
  username: string,
  packages: Record<string, PackageDetailsVersion>,
  timestamp: number
) {
  return {
    type: SET_PACKAGE_DETAIL_ACTION,
    payload: {
      username,
      packages,
      timestamp,
    },
  } as const;
}

export function setOrgTargetType(username: string, target: TargetType) {
  return {
    type: SET_ORG_TARGET_TYPE,
    payload: {
      username,
      target,
    },
  } as const;
}

export function togglePendingPackageUpgrade(username: string, packageId: string) {
  return {
    type: TOGGLE_PENDING_PACKAGE_UPGRADE,
    payload: {
      username,
      packageId,
    },
  } as const;
}

export function toggleAllPendingPackageUpgrade(username: string) {
  return {
    type: TOGGLE_ALL_PENDING_PACKAGE_UPGRADE,
    payload: {
      username,
    },
  } as const;
}

// function packageInstallRequestStatusUpdate(username: string, requests: PackageInstallRequest[]) {
//   return {
//     type: PACKAGE_INSTALL_REQUEST_STATUS_UPDATE,
//     payload: {
//       username,
//       requests,
//     },
//   } as const;
// }

export function checkInstalledPackages(username: string): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const { authorityUsername } = getState().packages;

    dispatch(setPackageActionStatus(username, "pending_subscriber"));

    try {
      const installedPackages = await packageManager.listSubscriberPackageVersions(username);
      dispatch(setPackageActionStatus(username, "pending_authority"));

      const targetPackageVersions = await Promise.all([
        packageManager.getLatestAvailablePackageVersions(authorityUsername, installedPackages),
        packageManager.getLatestPatchPackageVersions(authorityUsername, installedPackages),
      ]);

      dispatch(setPackageActionStatus(username, "pending_details"));
      const packageDetailGroups = await packageManager.getAuthorityPackageDetails(
        authorityUsername,
        [installedPackages, ...targetPackageVersions]
      );

      const isManagedMap = new Map<string, boolean>();
      installedPackages.forEach(({ packageId, isManaged }) => {
        isManagedMap.set(packageId, isManaged);
      });

      const targetList = ["installed", "latest", "patch"];

      const out: Record<string, PackageDetailsVersion> = {};
      packageDetailGroups.forEach((packageDetails, targetIndex) => {
        packageDetails.forEach((packageDetail) => {
          (out[packageDetail.packageId] ??= {
            isManaged: isManagedMap.get(packageDetail.packageId) ?? false,
            targets: {},
          }).targets[targetList[targetIndex]] = packageDetail;
        });
      });

      dispatch(setPackageDetails(username, out, Date.now()));
    } catch (error) {
      dispatch(createErrorToast("There was an error fetching you package data 🤔", error));
    } finally {
      dispatch(setPackageActionStatus(username, "ideal"));
    }
  };
}

// export function installPackages(
//   username: string,
//   targets: AuthorityPackageVersion[]
// ): ThunkResult<Promise<void>> {
//   return async (dispatch) => {
//     try {
//       const requests = await packageManager.createPackagesInstallRequests(username, targets);
//       dispatch(packageInstallRequestStatusUpdate(username, requests));
//       dispatch(checkPackageInstallRequests(username, requests));
//     } catch (error) {
//       dispatch(createErrorToast("There was an error upgrading your packages", error));
//     }
//   };
// }

// function checkPackageInstallRequests(
//   username: string,
//   requests: PackageInstallRequest[]
// ): ThunkResult<Promise<void>> {
//   return async (dispatch) => {
//     try {
//       const nextRequests = await packageManager.checkPackageInstallRequests(username, requests);
//       const statusChange = nextRequests.some(
//         (nextRequest, index) => nextRequest.status !== requests[index].status
//       );
//       const pendingRequests = nextRequests.filter(({ status }) => status === "pending");

//       if (statusChange) {
//         dispatch(packageInstallRequestStatusUpdate(username, nextRequests));
//       }

//       if (pendingRequests.length > 0) {
//         await delay(10000);
//         dispatch(checkPackageInstallRequests(username, pendingRequests));
//       }
//     } catch (error) {
//       dispatch(createErrorToast("There was an error upgrading your packages", error));
//     }
//   };
// }

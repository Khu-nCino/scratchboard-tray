import { ScratchBoardThunk } from "..";
import { createErrorToast, createToast } from "../messages";
import { OrgActionStatus, TargetType } from "./state";
import { AuthorityPackageVersion, packageManager } from "renderer/api/core/PackageManager";
import { delay } from "common/util";

export const SET_PACKAGE_AUTHORITY_USERNAME = "SET_PACKAGE_AUTHORITY_USERNAME";
export const SET_PACKAGE_ACTION_STATUS = "SET_PACKAGE_ACTION_STATUS";
export const SET_ORG_TARGET_TYPE = "SET_ORG_TARGET_TYPE";
export const SET_PACKAGE_DETAIL_ACTION = "SET_PACKAGE_DETAIL_ACTION";
export const TOGGLE_PENDING_PACKAGE_UPGRADE = "TOGGLE_PENDING_PACKAGE_UPGRADE";
export const TOGGLE_ALL_PENDING_PACKAGE_UPGRADE = "TOGGLE_ALL_PENDING_PACKAGE_UPGRADE";
export const CREATE_PACKAGE_INSTALL_REQUEST = "CREATE_PACKAGE_INSTALL_REQUEST";
export const SET_PACKAGE_INSTALL_SUCCESS = "SET_PACKAGE_INSTALL_SUCCESS";
export const SET_PACKAGE_INSTALL_ERROR = "SET_PACKAGE_INSTALL_ERROR";
export const SET_PACKAGE_INSTALL_PROCESS_ERROR = "SET_PACKAGE_INSTALL_PROCESS_ERROR";

export type PackagesAction =
  | ReturnType<typeof setPackageAuthorityUsername>
  | ReturnType<typeof setPackageDetails>
  | ReturnType<typeof setOrgTargetType>
  | ReturnType<typeof setPackageActionStatus>
  | ReturnType<typeof togglePendingPackageUpgrade>
  | ReturnType<typeof toggleAllPendingPackageUpgrade>
  | ReturnType<typeof createPackageInstallRequest>
  | ReturnType<typeof setPackageInstallSuccess>
  | ReturnType<typeof setPackageInstallError>
  | ReturnType<typeof setPackageInstallProcessError>;
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

function createPackageInstallRequest(username: string, totalPackages: number, timestamp: number) {
  return {
    type: CREATE_PACKAGE_INSTALL_REQUEST,
    payload: {
      username,
      totalPackages,
      timestamp,
    },
  } as const;
}

function setPackageInstallSuccess(username: string, packageIds: string[]) {
  return {
    type: SET_PACKAGE_INSTALL_SUCCESS,
    payload: {
      username,
      packageIds,
    },
  } as const;
}

function setPackageInstallError(
  username: string,
  packages: { packageId: string; errors: string[] }[]
) {
  return {
    type: SET_PACKAGE_INSTALL_ERROR,
    payload: {
      username,
      packages,
    },
  } as const;
}

function setPackageInstallProcessError(username: string) {
  return {
    type: SET_PACKAGE_INSTALL_PROCESS_ERROR,
    payload: {
      username,
    },
  } as const;
}

export function checkInstalledPackages(username: string): ScratchBoardThunk<Promise<void>> {
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

export function installPackages(
  username: string,
  targets: AuthorityPackageVersion[]
): ScratchBoardThunk<Promise<void>> {
  return async (dispatch) => {
    try {
      dispatch(createPackageInstallRequest(username, targets.length, Date.now()));
      const originalRequests = await packageManager.createPackagesInstallRequests(
        username,
        targets
      );
      let activeRequests = originalRequests;
      let someErrors = false;

      while (activeRequests.length > 0) {
        await delay(60000);
        const nextRequests = await packageManager.checkPackageInstallRequests(
          username,
          activeRequests
        );

        const successIds = nextRequests
          .filter(({ status }) => status === "success")
          .map((pack) => pack.packageVersion.packageId);

        const errorPackages = nextRequests
          .filter(({ status }) => status === "error")
          .map((pack) => ({ packageId: pack.packageVersion.packageId, errors: [] }));

        if (successIds.length > 0) {
          dispatch(setPackageInstallSuccess(username, successIds));
        }

        if (errorPackages.length > 0) {
          dispatch(setPackageInstallError(username, errorPackages));
          someErrors = true;
        }

        activeRequests = nextRequests.filter(({ status }) => status === "pending");
      }

      if (someErrors) {
        dispatch(createToast("Package install request complete with errors", "warning"));
      } else {
        dispatch(createToast("Package install request complete", "success"));
      }
    } catch (error) {
      dispatch(createErrorToast("There was an error upgrading your packages", error));
      dispatch(setPackageInstallProcessError(username));
    }
  };
}

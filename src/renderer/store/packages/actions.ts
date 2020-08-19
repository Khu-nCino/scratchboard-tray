import { ThunkAction } from "redux-thunk";
import { State } from "..";
import { MessagesAction, createErrorToast } from "../messages";
import { OrgActionStatus, TargetType, targetTypes } from "./state";
import {
  SubscriberPackageVersion,
  AuthorityPackageVersion,
  PackageVersion,
  PackageInstallRequest,
  packageManager,
} from "renderer/api/core/PackageManager";
import { groupBy2, delay } from "common/util";

export const SET_PACKAGE_AUTHORITY_USERNAME = "SET_PACKAGE_AUTHORITY_USERNAME";
export const SET_PACKAGE_ACTION_STATUS = "SET_PACKAGE_ACTION_STATUS";
export const SET_INSTALLED_PACKAGE_VERSIONS = "SET_INSTALLED_PACKAGE_VERSIONS";
export const SET_TARGET_VERSIONS = "SET_TARGET_VERSIONS";
export const SET_PACKAGE_DETAIL_ACTION = "SET_PACKAGE_DETAIL_ACTION";
export const TOGGLE_PENDING_PACKAGE_UPGRADE = "TOGGLE_PENDING_PACKAGE_UPGRADE";
export const TOGGLE_ALL_PENDING_PACKAGE_UPGRADE = "TOGGLE_ALL_PENDING_PACKAGE_UPGRADE";
export const PACKAGE_INSTALL_REQUEST_STATUS_UPDATE = "PACKAGE_INSTALL_REQUEST_STATUS_UPDATE";

export type PackagesAction =
  | ReturnType<typeof setPackageAuthorityUsername>
  | ReturnType<typeof setInstalledPackageVersions>
  | ReturnType<typeof setPackageDetails>
  | ReturnType<typeof setTargetVersions>
  | ReturnType<typeof setPackageActionStatus>
  | ReturnType<typeof togglePendingPackageUpgrade>
  | ReturnType<typeof toggleAllPendingPackageUpgrade>
  | ReturnType<typeof packageInstallRequestStatusUpdate>;

type ThunkResult<R> = ThunkAction<R, State, undefined, PackagesAction | MessagesAction>;

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

function setInstalledPackageVersions(
  username: string,
  versions: SubscriberPackageVersion[],
  timestamp: number
) {
  return {
    type: SET_INSTALLED_PACKAGE_VERSIONS,
    payload: {
      username,
      versions,
      timestamp,
    },
  } as const;
}

function setTargetVersions(targets: Record<TargetType, PackageVersion[]>) {
  return {
    type: SET_TARGET_VERSIONS,
    payload: {
      targets,
    },
  } as const;
}

function setPackageDetails(versions: Record<string, Record<string, AuthorityPackageVersion>>) {
  return {
    type: SET_PACKAGE_DETAIL_ACTION,
    payload: {
      versions,
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

function packageInstallRequestStatusUpdate(username: string, requests: PackageInstallRequest[]) {
  return {
    type: PACKAGE_INSTALL_REQUEST_STATUS_UPDATE,
    payload: {
      username,
      requests,
    },
  } as const;
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
      const latestPackageVersions = await Promise.all(targetTypes.map((target) => packageManager.getLatestAvailablePackageVersions(
        authorityUsername,
        packageIds,
        target
      )));

      dispatch(setPackageActionStatus(username, "pending_details"));
      const packageDetails = await packageManager.getAuthorityPackageDetails(authorityUsername, [
        ...installedPackages,
        ...latestPackageVersions.flat(),
      ]);

      const latestVersionSet = new Set<string>(
        latestPackageVersions.map(({ sortingVersion }) => sortingVersion)
      );

      const latestPackageDetails = packageDetails.filter((packageDetail) =>
        latestVersionSet.has(packageDetail.sortingVersion)
      );

      const packageDetailMap = groupBy2(packageDetails, "packageId", "versionName");

      //dispatch(setLatestPackageVersions(latestPackageDetails, Date.now()));
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

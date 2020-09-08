import {
  PackagesState,
  defaultPackagesState,
  defaultOrgPackageState,
  defaultOrgPackage,
} from "./state";
import {
  PackagesAction,
  SET_PACKAGE_AUTHORITY_USERNAME,
  SET_PACKAGE_ACTION_STATUS,
  TOGGLE_PENDING_PACKAGE_UPGRADE,
  TOGGLE_ALL_PENDING_PACKAGE_UPGRADE,
  SET_PACKAGE_DETAIL_ACTION,
  SET_ORG_TARGET_TYPE,
  CREATE_PACKAGE_INSTALL_REQUEST,
  SET_PACKAGE_INSTALL_SUCCESS,
  SET_PACKAGE_INSTALL_ERROR,
  SET_PACKAGE_INSTALL_PROCESS_ERROR,
} from "./actions";
import { isUpgradeAvailable } from "./selectors";

export function packagesReducer(
  state: PackagesState = defaultPackagesState,
  action: PackagesAction
): PackagesState {
  switch (action.type) {
    case SET_PACKAGE_AUTHORITY_USERNAME:
      return {
        ...state,
        authorityUsername: action.payload.username,
      };
    case SET_PACKAGE_ACTION_STATUS:
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
    case TOGGLE_PENDING_PACKAGE_UPGRADE: {
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
    case TOGGLE_ALL_PENDING_PACKAGE_UPGRADE: {
      const { username } = action.payload;
      const currentOrgInfo = state.orgInfo[username];
      if (currentOrgInfo === undefined) {
        return state;
      }

      const nextValue = !Object.values(currentOrgInfo.packages)
        .filter((pack) => isUpgradeAvailable(pack, currentOrgInfo.target))
        .every(({ upgradeSelected }) => upgradeSelected);

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...currentOrgInfo,
            packages: Object.fromEntries(
              Object.entries(currentOrgInfo.packages).map(([packageId, pack]) => [
                packageId,
                !isUpgradeAvailable(pack, currentOrgInfo.target) ||
                nextValue === pack.upgradeSelected
                  ? pack
                  : {
                      ...pack,
                      upgradeSelected: nextValue,
                    },
              ])
            ),
          },
        },
      };
    }
    case SET_ORG_TARGET_TYPE: {
      const { username, target } = action.payload;

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...(state.orgInfo[username] ?? defaultOrgPackageState),
            target,
          },
        },
      };
    }
    case SET_PACKAGE_DETAIL_ACTION: {
      const { username, packages, timestamp } = action.payload;
      const previousOrgInfo = state.orgInfo[username] ?? defaultOrgPackageState;

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...previousOrgInfo,
            versionsCheckedTimestamp: timestamp,
            packages: {
              ...previousOrgInfo.packages,
              ...Object.fromEntries(
                Object.entries(packages).map(([packageId, pack]) => [
                  packageId,
                  {
                    ...(previousOrgInfo.packages[packageId] ?? defaultOrgPackage),
                    installStatus: "idle",
                    upgradeSelected: false,
                    ...pack,
                  },
                ])
              ),
            },
          },
        },
      };
    }
    case CREATE_PACKAGE_INSTALL_REQUEST: {
      const { username, timestamp } = action.payload;
      const previousOrgInfo = state.orgInfo[username] ?? defaultOrgPackageState;

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...previousOrgInfo,
            installRequestTimestamp: timestamp,
            packages: Object.fromEntries(
              Object.entries(previousOrgInfo.packages).map(([packId, pack]) => [
                packId,
                pack.upgradeSelected &&
                pack.installStatus === "idle" &&
                isUpgradeAvailable(pack, previousOrgInfo.target)
                  ? { ...pack, installStatus: "pending" }
                  : pack,
              ])
            ),
          },
        },
      };
    }
    case SET_PACKAGE_INSTALL_SUCCESS: {
      const { username, packageIds } = action.payload;
      const packageIdSet = new Set(packageIds);

      const previousOrgInfo = state.orgInfo[username];
      if (previousOrgInfo === undefined) {
        return state;
      }

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...previousOrgInfo,
            packages: Object.fromEntries(
              Object.entries(previousOrgInfo.packages).map(([packageId, pack]) => [
                packageId,
                packageIdSet.has(packageId)
                  ? {
                      ...pack,
                      installStatus: "success",
                      targets: {
                        ...pack.targets,
                        [previousOrgInfo.target]: pack.targets.installed,
                      },
                    }
                  : pack,
              ])
            ),
          },
        },
      };
    }
    case SET_PACKAGE_INSTALL_ERROR: {
      const { username, packages } = action.payload;
      const packageErrorMap = new Map(packages.map(({ packageId, errors }) => [packageId, errors]));

      const previousOrgInfo = state.orgInfo[username];
      if (previousOrgInfo === undefined) {
        return state;
      }

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...previousOrgInfo,
            packages: Object.fromEntries(
              Object.entries(previousOrgInfo.packages).map(([packageId, pack]) => [
                packageId,
                packageErrorMap.has(packageId) ? { ...pack, installStatus: "error" } : pack,
              ])
            ),
          },
        },
      };
    }
    case SET_PACKAGE_INSTALL_PROCESS_ERROR: {
      const { username } = action.payload;

      const previousOrgInfo = state.orgInfo[username];
      if (previousOrgInfo === undefined) {
        return state;
      }

      return {
        ...state,
        orgInfo: {
          ...state.orgInfo,
          [username]: {
            ...previousOrgInfo,
            packages: Object.fromEntries(
              Object.entries(previousOrgInfo.packages).map(([packageId, pack]) => [
                packageId,
                pack.installStatus === "pending" ? { ...pack, installStatus: "error" } : pack,
              ])
            ),
          },
        },
      };
    }
    default:
      return state;
  }
}

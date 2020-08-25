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
                    ...pack,
                  },
                ])
              ),
            },
          },
        },
      };
    }
    default:
      return state;
  }
}

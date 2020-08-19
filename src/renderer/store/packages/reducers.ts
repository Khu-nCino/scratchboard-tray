import {
  PackagesState,
  defaultPackagesState,
  defaultOrgPackageState,
  defaultPackageInfo,
} from "./state";
import {
  PackagesAction,
  SET_PACKAGE_AUTHORITY_USERNAME,
  SET_PACKAGE_ACTION_STATUS,
  SET_INSTALLED_PACKAGE_VERSIONS,
  TOGGLE_PENDING_PACKAGE_UPGRADE,
  TOGGLE_ALL_PENDING_PACKAGE_UPGRADE,
  SET_PACKAGE_DETAIL_ACTION,
  SET_TARGET_VERSIONS,
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
    case SET_INSTALLED_PACKAGE_VERSIONS:
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
    case SET_TARGET_VERSIONS: {
      return {
        ...state,
        packageInfo: {
          ...state.packageInfo,
          ...Object.fromEntries(
            Object.entries(action.payload.targets).map(([packageId, targets]) => [
              packageId,
              {
                ...(state.packageInfo[packageId] ?? defaultPackageInfo),
                targetVersions: {
                  ...(state.packageInfo[packageId]?.targetVersions ?? {}),
                  ...targets,
                },
              },
            ])
          ),
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
      return {
        ...state,
        packageInfo: {
          ...state.packageInfo,
          ...Object.fromEntries(
            Object.entries(action.payload.versions).map(([packageId, versions]) => [
              packageId,
              {
                ...(state.packageInfo[packageId] ?? defaultPackageInfo),
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

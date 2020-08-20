import { OrgPackageState, defaultOrgPackageState, PackagesState } from "./state";
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";
import { State } from "..";
import { compareVersions } from "renderer/api/core/util";

export interface OrgPackageDetails extends OrgPackageState {
  readonly packages: Record<
    string,
    {
      installedVersionInfo?: AuthorityPackageVersion;
      latestVersionInfo?: AuthorityPackageVersion;
      sameVersion: boolean;
      upgradeAvailable: boolean;
      installedVersion: string;
      upgradeSelected: boolean;
      isManaged: boolean;
    }
  >;
}

export function selectOrgPackageDetails(
  { packages: state }: State,
  username: string
): OrgPackageDetails {
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
        const targetVersion = packageInfo.targetVersions[orgInfo.target];

        const installedVersionInfo = packageInfo?.versions[info.installedVersion];
        const latestVersionInfo = targetVersion === undefined ? undefined : packageInfo?.versions[targetVersion];

        const versionCompare = targetVersion === undefined ? undefined : compareVersions(info.installedVersion, targetVersion);
        return [
          packageId,
          {
            ...info,
            installedVersionInfo,
            latestVersionInfo,
            sameVersion: versionCompare === 0,
            upgradeAvailable: info.isManaged && versionCompare === -1,
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
  const orgPackage = orgInfo[username]?.packages[packageId];

  const installedVersion = orgPackage?.installedVersion;
  const isManaged = orgPackage?.isManaged;
  const latestVersion = packageInfo[packageId]?.targetVersions[orgInfo[username]?.target];

  return (
    isManaged &&
    installedVersion !== undefined &&
    latestVersion !== undefined &&
    compareVersions(installedVersion, latestVersion) === -1
  );
}

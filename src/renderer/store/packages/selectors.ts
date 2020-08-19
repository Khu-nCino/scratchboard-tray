import { OrgPackageState, defaultOrgPackageState, PackagesState } from "./state";
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";
import { State } from "..";

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
  const orgPackage = orgInfo[username]?.packages[packageId];

  const installedVersion = orgPackage?.installedVersion;
  const isManaged = orgPackage?.isManaged;
  const latestVersion = packageInfo[packageId]?.latestVersionName;

  return (
    isManaged &&
    installedVersion !== undefined &&
    latestVersion !== undefined &&
    installedVersion !== latestVersion
  );
}

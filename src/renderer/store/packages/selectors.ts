import { PackagesState } from "./state";
import { compareVersions } from "renderer/api/core/util";

export function isUpgradeAvailable(
  state: PackagesState,
  username: string,
  packageId: string
): boolean {
  const orgInfo = state.orgInfo[username];
  const orgPackage = orgInfo?.packages[packageId];
  const orgTargets = orgPackage?.targets;

  const installedVersion = orgTargets.installed;
  const latestVersion = orgTargets?.[orgInfo.target];
  const isManaged = orgPackage?.isManaged;

  return (
    isManaged && compareVersions(installedVersion?.versionName, latestVersion?.versionName) === -1
  );
}

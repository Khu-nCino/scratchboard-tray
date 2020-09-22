import { OrgPackage, TargetType } from "./state";

export function isUpgradeAvailable(
  { targets, installStatus }: OrgPackage,
  target: TargetType
) {
  const targetValue = targets[target];

  return (
    installStatus === "idle" &&
    targets.installed !== undefined &&
    targetValue !== undefined &&
    targetValue.isManaged &&
    targets.installed.packageVersionId !== targetValue.packageVersionId
  );
}

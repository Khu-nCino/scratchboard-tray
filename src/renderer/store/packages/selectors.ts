import { OrgPackage, TargetType } from "./state";

export function isUpgradeAvailable(
  { isManaged, targets, installStatus }: OrgPackage,
  target: TargetType
) {
  const targetValue = targets[target];

  return (
    isManaged &&
    installStatus === "idle" &&
    targets.installed !== undefined &&
    targetValue !== undefined &&
    targets.installed.packageVersionId !== targetValue.packageVersionId
  );
}

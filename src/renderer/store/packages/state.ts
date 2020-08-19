import { PackageInstallRequest, AuthorityPackageVersion } from "renderer/api/core/PackageManager";

export const targetTypes = [
  "Latest",
  "Patch"
] as const;

export type TargetType = typeof targetTypes[number];

export type OrgActionStatus =
  | "initial"
  | "ideal"
  | "pending_subscriber"
  | "pending_authority"
  | "pending_details";

interface OrgPackageInstallRequest {
  requests: PackageInstallRequest[];
  timestamp: number;
}

interface OrgPackage {
  readonly installedVersion: string;
  readonly isManaged: boolean;
  readonly upgradeSelected: boolean;
}

export interface OrgPackageState {
  readonly actionStatus: OrgActionStatus;
  readonly lastInstalledVersionsChecked?: number;
  readonly packages: Record<string, OrgPackage>;

  readonly target: TargetType;
  readonly installRequest?: OrgPackageInstallRequest;
}

interface PackageInfo {
  readonly targetVersions: Partial<Record<TargetType, string>>;

  readonly versions: Record<string, AuthorityPackageVersion>;
}

export interface PackagesState {
  readonly authorityUsername: string;

  readonly orgInfo: Record<string, OrgPackageState>;
  readonly packageInfo: Record<string, PackageInfo>;
}

export const defaultOrgPackageState: OrgPackageState = {
  actionStatus: "initial",
  packages: {},
  target: "Latest",
};

export const defaultPackagesState: PackagesState = {
  authorityUsername: "",
  orgInfo: {},
  packageInfo: {},
};

export const defaultPackageInfo: PackageInfo = {
  targetVersions: {},
  versions: {}
}
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";

export const targetTypes = ["latest", "patch"] as const;

export type TargetType = typeof targetTypes[number];

export type OrgActionStatus =
  | "initial"
  | "ideal"
  | "pending_subscriber"
  | "pending_authority"
  | "pending_details";

interface OrgPackageInstallRequest {
  status: "pending" | "success" | "error";
  timestamp: number;
}

interface OrgPackage {
  readonly isManaged: boolean;
  readonly upgradeSelected: boolean;
  readonly targets: {
    readonly installed?: AuthorityPackageVersion;
    readonly latest?: AuthorityPackageVersion;
    readonly patch?: AuthorityPackageVersion;
  };
}

export interface OrgPackageState {
  readonly actionStatus: OrgActionStatus;
  readonly versionsCheckedTimestamp?: number;
  readonly packages: Record<string, OrgPackage>;

  readonly target: TargetType;
  readonly installRequest?: OrgPackageInstallRequest;
}

export interface PackagesState {
  readonly authorityUsername: string;

  readonly orgInfo: Record<string, OrgPackageState>;
}

export const defaultOrgPackageState: OrgPackageState = {
  actionStatus: "initial",
  packages: {},
  target: "latest",
};

export const defaultPackagesState: PackagesState = {
  authorityUsername: "",
  orgInfo: {},
};

export const defaultOrgPackage: OrgPackage = {
  isManaged: false,
  upgradeSelected: false,
  targets: {},
}

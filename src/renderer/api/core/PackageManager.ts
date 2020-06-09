import { shrink } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { formatQueryList } from "./util";

interface SubscriberPackage {
  Name: string;
  NamespacePrefix: string;
}

interface SubscriberPackageVersion {
  Name: string;
  MajorVersion: number;
  MinorVersion: number;
  PatchVersion: number;
  BuildNumber: number;
}

interface InstalledSubscriberPackage {
  Id: string;
  SubscriberPackage: SubscriberPackage;
  SubscriberPackageVersion: SubscriberPackageVersion;
}

export interface PackageVersion {
  readonly namespace: string;
  readonly version: string;
}

export interface InstalledPackageVersion extends PackageVersion {}

export interface InstallablePackageVersion extends PackageVersion {
  readonly password: string;
}

const installedPackageVersionsQuery = shrink`
SELECT
  Id,
  SubscriberPackage.Name,
  SubscriberPackage.NamespacePrefix,
  SubscriberPackageVersion.Name,
  SubscriberPackageVersion.MajorVersion,
  SubscriberPackageVersion.MinorVersion,
  SubscriberPackageVersion.PatchVersion,
  SubscriberPackageVersion.BuildNumber
FROM
  InstalledSubscriberPackage
`;

export class PackageManager {
  constructor(private cache: OrgCache) {}

  async getInstalledPackageVersions(username: string): Promise<InstalledPackageVersion[]> {
    const versions = await this.cache.query<InstalledSubscriberPackage>(
      username,
      installedPackageVersionsQuery,
      true
    );
    return versions.map((version) => ({
      namespace: version.SubscriberPackage.NamespacePrefix,
      version: version.SubscriberPackageVersion.Name,
    }));
  }

  getLatestAvailablePackageVersions(
    username: string,
    namespaces: string[]
  ): Promise<InstallablePackageVersion[]> {
    return this.cache.queryDevHub<InstallablePackageVersion>(
      username,
      shrink`
        SELECT
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c namespace,
          MAX(PackageManager__Sorting_Version_Number__c) version,
          MAX(PackageManager__Password__c) password
        FROM
          PackageManager__Package_Version__c
        WHERE
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c IN (${formatQueryList(namespaces)})
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = false
        GROUP BY PackageManager__Package__r.PackageManager__Namespace_Prefix__c
      `
    );
  }
}

// I'm not happy with this but don't want to take the time to fix it ;(
export const packageManager = new PackageManager(orgCache);

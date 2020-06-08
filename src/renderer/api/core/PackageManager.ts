import { OrgCache } from "./OrgCache";

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

interface InstallablePackageVersion {
  namespace: string,
  version: string,
  password: string
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

  getInstalledPackageVersions(username: string) {
    return this.cache.query<InstalledSubscriberPackage>(
      username,
      installedPackageVersionsQuery,
      true
    );
  }

  async getLatestAvailablePackageVersions(username: string, namespaces: string[]) {
    const info = await this.cache.getAuthInfo(username);

    return this.cache.query<InstallablePackageVersion>(
      info.getFields().devHubUsername!,
      shrink`
        SELECT
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c namespace,
          MAX(PackageManager__Sorting_Version_Number__c) version,
          MAX(PackageManager__Password__c) password
        FROM
          PackageManager__Package_Version__c
        WHERE
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c IN (${namespaces.map((namespace) => `'${namespace}'`).join()})
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = false
        GROUP BY PackageManager__Package__r.PackageManager__Namespace_Prefix__c
      `,
      false
    );
  }
}

function shrink(strings: TemplateStringsArray, ...placeholders: any[]) {
  const withSpace = strings.reduce((result, string, i) => result + placeholders[i - 1] + string);
  return withSpace.trim().replace(/\s\s+/g, " ");
}

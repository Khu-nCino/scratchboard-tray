import { shrink as strip } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { formatQueryList } from "./util";

export interface PackageVersion {
  readonly packageId: string;
  readonly namespace: string;
  readonly versionName: string;
}

export interface SortingPackageVersion {
  readonly packageId: string;
  readonly sortingVersion: string;
}

export interface SubscriberPackageVersion extends PackageVersion {}

export interface AuthorityPackageVersion extends PackageVersion {
  readonly password: string;
  readonly buildDate: string;
  readonly sortingVersion: string;
}

const installedPackageVersionsQuery = strip`
SELECT
  SubscriberPackageId,
  SubscriberPackage.NamespacePrefix,
  SubscriberPackageVersion.Name
FROM
  InstalledSubscriberPackage
`;

export class PackageManager {
  constructor(private cache: OrgCache) {}

  async listSubscriberPackageVersions(username: string): Promise<SubscriberPackageVersion[]> {
    interface RawInstalledSubscriberPackage {
      SubscriberPackageId: string;
      SubscriberPackage: {
        NamespacePrefix: string;
      };
      SubscriberPackageVersion: {
        Name: string;
      };
    }

    const versions = await this.cache.query<RawInstalledSubscriberPackage>(
      username,
      installedPackageVersionsQuery,
      true
    );
    return versions.map((version) => ({
      packageId: version.SubscriberPackageId,
      namespace: version.SubscriberPackage.NamespacePrefix,
      versionName: version.SubscriberPackageVersion.Name,
    }));
  }

  getLatestAvailablePackageVersions(
    authorityUsername: string,
    packageIds: string[]
  ): Promise<SortingPackageVersion[]> {
    if (packageIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.cache.query<SortingPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.PackageManager__Metadata_Package_Id__c packageId,
          MAX(PackageManager__Sorting_Version_Number__c) sortingVersion
        FROM
          PackageManager__Package_Version__c
        WHERE
          PackageManager__Package__r.PackageManager__Metadata_Package_Id__c IN (${formatQueryList(
            packageIds
          )})
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = false
        GROUP BY PackageManager__Package__r.PackageManager__Metadata_Package_Id__c
      `
    );
  }

  groupVersions(versions: (SortingPackageVersion | SubscriberPackageVersion)[]) {
    return versions.reduce<Record<string, { sorting: string[]; subscriber: string[] }>>(
      (out, version) => {
        const { packageId } = version;
        const entry = out[packageId] ?? (out[packageId] = { sorting: [], subscriber: [] });

        if ("sortingVersion" in version) {
          entry.sorting.push(version.sortingVersion);
        } else {
          entry.subscriber.push(version.versionName);
        }

        return out;
      },
      {}
    );
  }

  versionsGroupToSelector(versionMap: Record<string, { sorting: string[]; subscriber: string[] }>) {
    return Object.entries(versionMap)
      .map(([namespace, { sorting, subscriber }]) => {
        const sortingSelect =
          sorting.length === 0
            ? undefined
            : `PackageManager__Sorting_Version_Number__c IN (${formatQueryList(sorting)})`;
        const subscriberSelect =
          subscriber.length === 0 ? undefined : `Name IN (${formatQueryList(subscriber)})`;

        let versionSelectors =
          sortingSelect !== undefined && subscriberSelect !== undefined
            ? `(${sortingSelect} OR ${subscriberSelect})`
            : sortingSelect ?? subscriberSelect;

        return `(PackageManager__Package__r.PackageManager__Metadata_Package_Id__c = '${namespace}' AND ${versionSelectors})`;
      })
      .join(" OR ");
  }

  async getAuthorityPackageDetails(
    authorityUsername: string,
    versions: (SortingPackageVersion | SubscriberPackageVersion)[]
  ): Promise<AuthorityPackageVersion[]> {
    if (versions.length === 0) {
      return [];
    }

    const versionsGroup = this.groupVersions(versions);
    const versionsSelector = this.versionsGroupToSelector(versionsGroup);

    interface RawAuthorityPackageVersion {
      Name: string;
      PackageManager__Build_Date__c: string;
      PackageManager__Password__c: string;
      PackageManager__Metadata_Package_Version_Id__c: string;
      PackageManager__Sorting_Version_Number__c: string;
      PackageManager__Package__r: {
        PackageManager__Namespace_Prefix__c: string;
      };
    }

    const latestVersionsDetails = await this.cache.query<RawAuthorityPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c,
          Name,
          PackageManager__Sorting_Version_Number__c,
          PackageManager__Build_Date__c,
          PackageManager__Metadata_Package_Version_Id__c,
          PackageManager__Password__c
        FROM
          PackageManager__Package_Version__c
        WHERE
          ${versionsSelector}
      `
    );

    return latestVersionsDetails.map((version) => ({
      namespace: version.PackageManager__Package__r.PackageManager__Namespace_Prefix__c,
      versionName: version.Name,
      buildDate: version.PackageManager__Build_Date__c,
      packageId: version.PackageManager__Metadata_Package_Version_Id__c,
      password: version.PackageManager__Password__c,
      sortingVersion: version.PackageManager__Sorting_Version_Number__c,
    }));
  }
}

// Singletons ftw
export const packageManager = new PackageManager(orgCache);

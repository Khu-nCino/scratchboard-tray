import { shrink as strip } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { formatQueryList, trimTo15 } from "./util";
import { RecordResult, SuccessResult } from 'jsforce'

export interface PackageVersion {
  readonly packageId: string;
  readonly versionName: string;
}

export interface SortingPackageVersion {
  readonly packageId: string;
  readonly sortingVersion: string;
}

export interface SubscriberPackageVersion extends PackageVersion {}

export interface AuthorityPackageVersion extends PackageVersion {
  readonly packageName: string;
  readonly packageVersionId: string;
  readonly namespace: string;
  readonly password: string;
  readonly buildDate: string;
  readonly sortingVersion: string;
}

const installedPackageVersionsQuery = strip`
SELECT
  SubscriberPackageId,
  SubscriberPackageVersion.Name
FROM
  InstalledSubscriberPackage
`;

export class PackageManager {
  constructor(private cache: OrgCache) {}

  async listSubscriberPackageVersions(username: string): Promise<SubscriberPackageVersion[]> {
    interface RawInstalledSubscriberPackage {
      SubscriberPackageId: string;
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
      versionName: version.SubscriberPackageVersion.Name,
    }));
  }

  async getLatestAvailablePackageVersions(
    authorityUsername: string,
    packageIds: string[]
  ): Promise<SortingPackageVersion[]> {
    if (packageIds.length === 0) {
      return [];
    }

    const idsToQuery: string[] = [];
    const trimmedIdToFull = new Map<string, string>();
    for (const packageId of packageIds) {
      const trimmedId = trimTo15(packageId);

      idsToQuery.push(packageId);
      if (trimmedId !== packageId) {
        trimmedIdToFull.set(trimmedId, packageId);
        idsToQuery.push(trimmedId);
      }
    }

    const results = await this.cache.query<SortingPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.PackageManager__Metadata_Package_Id__c packageId,
          MAX(PackageManager__Sorting_Version_Number__c) sortingVersion
        FROM
          PackageManager__Package_Version__c
        WHERE
          PackageManager__Package__r.PackageManager__Metadata_Package_Id__c ${formatQueryList(
            idsToQuery
          )}
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = false
        GROUP BY PackageManager__Package__r.PackageManager__Metadata_Package_Id__c
      `
    );

    return results.map((result) => ({
      ...result,
      packageId: trimmedIdToFull.get(result.packageId) ?? result.packageId,
    }));
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
      .map(([packageId, { sorting, subscriber }]) => {
        const sortingSelect =
          sorting.length === 0
            ? undefined
            : `PackageManager__Sorting_Version_Number__c ${formatQueryList(sorting)}`;
        const subscriberSelect =
          subscriber.length === 0 ? undefined : `Name ${formatQueryList(subscriber)}`;

        let versionSelectors =
          sortingSelect !== undefined && subscriberSelect !== undefined
            ? `(${sortingSelect} OR ${subscriberSelect})`
            : sortingSelect ?? subscriberSelect;

        return `(PackageManager__Package__r.PackageManager__Metadata_Package_Id__c IN ('${trimTo15(
          packageId
        )}','${packageId}') AND ${versionSelectors})`;
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
        Name: string;
        PackageManager__Namespace_Prefix__c: string;
        PackageManager__Metadata_Package_Id__c: string;
      };
    }

    const latestVersionsDetails = await this.cache.query<RawAuthorityPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.Name,
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c,
          PackageManager__Package__r.PackageManager__Metadata_Package_Id__c,
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

    const trimmedIdToFull = Object.keys(versionsGroup).reduce((acc, packageId) => {
      acc.set(trimTo15(packageId), packageId);
      return acc;
    }, new Map<string, string>());

    return latestVersionsDetails.map((version) => {
      const packageId = version.PackageManager__Package__r.PackageManager__Metadata_Package_Id__c;

      return {
        packageName: version.PackageManager__Package__r.Name,
        packageId: trimmedIdToFull.get(packageId) ?? packageId,
        namespace: version.PackageManager__Package__r.PackageManager__Namespace_Prefix__c,
        versionName: version.Name,
        buildDate: version.PackageManager__Build_Date__c,
        packageVersionId: version.PackageManager__Metadata_Package_Version_Id__c,
        password: version.PackageManager__Password__c,
        sortingVersion: version.PackageManager__Sorting_Version_Number__c,
      };
    });
  }

  async installPackages(
    username: string,
    packageVersions: AuthorityPackageVersion[]
  ): Promise<void> {
    const connection = await this.cache.getConnection(username);

    const metadata = packageVersions.map(({ packageId, password }) => ({
      SubscriberPackageVersionKey: packageId,
      Password: password,
    }));

    const results = await connection.tooling.create("PackageInstallRequest", metadata);
    const resultArray = "length" in results ? results : [results];

    const out = resultArray.filter(isSuccess);
  }
}

function isSuccess(result: RecordResult): result is SuccessResult {
  return result.success;
}

// Singletons ftw
export const packageManager = new PackageManager(orgCache);

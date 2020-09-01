import { shrink as strip } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { formatQueryList, trimTo15, escapeSoql } from "./util";
import { RecordResult, SuccessResult, ErrorResult } from "jsforce";

export interface PackageVersion {
  readonly packageId: string;
  readonly versionName: string;
}

export interface SortingPackageVersion {
  readonly packageId: string;
  readonly sortingVersion: string;
}

export interface SubscriberPackageVersion extends PackageVersion {
  readonly isManaged: boolean;
}

export interface AuthorityPackageVersion extends PackageVersion {
  readonly packageName: string;
  readonly packageVersionId: string;
  readonly namespace: string;
  readonly password: string;
  readonly buildDate: string;
  readonly sortingVersion: string;
}

export interface PackageInstallRequest {
  readonly requestId: string;
  readonly packageVersion: AuthorityPackageVersion;
  readonly status: "pending" | "error" | "success";
}

interface PackageInstallRequestMetadata {
  readonly Id?: string;
  readonly NameConflictResolution: "Block" | "RenameMetadata";
  readonly SecurityType: "Full" | "Custom" | "None";
  readonly SubscriberPackageVersionKey: string;
  readonly Password: string;
  readonly Status?: "ERROR" | "IN_PROGRESS" | "SUCCESS";
  readonly errors?: { message: string }[];
}

const installedPackageVersionsQuery = strip`
SELECT
  SubscriberPackageId,
  SubscriberPackageVersion.Name,
  SubscriberPackageVersion.IsManaged,
  SubscriberPackageVersion.MajorVersion,
  SubscriberPackageVersion.MinorVersion,
  SubscriberPackageVersion.PatchVersion
FROM
  InstalledSubscriberPackage
`;

function formatVersionNumber(values: number[]): string {
  return values.filter((value) => value !== 0).join(".");
}

function sortingVersionToVersionName(sortingVersion: string): string {
  return formatVersionNumber(sortingVersion.split(".").map(Number));
}

export class PackageManager {
  constructor(private cache: OrgCache) {}

  async listSubscriberPackageVersions(username: string): Promise<SubscriberPackageVersion[]> {
    interface RawInstalledSubscriberPackage {
      SubscriberPackageId: string;
      SubscriberPackageVersion: {
        Name: string;
        IsManaged: boolean;
        MajorVersion: number;
        MinorVersion: number;
        PatchVersion: number;
      };
    }

    const versions = await this.cache.query<RawInstalledSubscriberPackage>(
      username,
      installedPackageVersionsQuery,
      true
    );
    return versions.map(
      ({
        SubscriberPackageId,
        SubscriberPackageVersion: { IsManaged, MajorVersion, MinorVersion, PatchVersion },
      }) => ({
        packageId: SubscriberPackageId,
        //versionName: version.SubscriberPackageVersion.Name,
        versionName: formatVersionNumber([MajorVersion, MinorVersion, PatchVersion]),
        isManaged: IsManaged,
      })
    );
  }

  async getLatestAvailablePackageVersions(
    authorityUsername: string,
    packages: { packageId: string }[]
  ): Promise<PackageVersion[]> {
    if (packages.length === 0) {
      return [];
    }

    const idsToQuery: string[] = [];
    const trimmedIdToFull = new Map<string, string>();
    for (const { packageId } of packages) {
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
          ${formatQueryList(
            "PackageManager__Package__r.PackageManager__Metadata_Package_Id__c",
            idsToQuery
          )}
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = false
        GROUP BY PackageManager__Package__r.PackageManager__Metadata_Package_Id__c
      `
    );

    return results.map(({ packageId, sortingVersion }) => ({
      packageId: trimmedIdToFull.get(packageId) ?? packageId,
      versionName: sortingVersionToVersionName(sortingVersion),
    }));
  }

  async getLatestPatchPackageVersions(
    authorityUsername: string,
    packages: { packageId: string; versionName: string }[]
  ): Promise<PackageVersion[]> {
    if (packages.length === 0) {
      return [];
    }

    const trimmedIdToFull = new Map<string, string>();
    const versionSelector = packages
      .map(({ packageId, versionName }) => {
        const trimmedId = trimTo15(packageId);
        const shortenedVersion = versionName.match(/^\d+(?:\.\d+)?/)?.[0] ?? ""; // TODO better default for no match.

        if (trimmedId !== packageId) {
          trimmedIdToFull.set(trimmedId, packageId);
        }

        return `(PackageManager__Package__r.PackageManager__Metadata_Package_Id__c IN ('${escapeSoql(
          trimmedId
        )}','${escapeSoql(packageId)}') AND Name LIKE '${escapeSoql(shortenedVersion)}%')`;
      })
      .join(" OR ");

    const results = await this.cache.query<SortingPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.PackageManager__Metadata_Package_Id__c packageId,
          MAX(PackageManager__Sorting_Version_Number__c) sortingVersion
        FROM
          PackageManager__Package_Version__c
        WHERE
          (${versionSelector})
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = true
        GROUP BY PackageManager__Package__r.PackageManager__Metadata_Package_Id__c
      `
    );

    return results.map(({ packageId, sortingVersion }) => ({
      packageId: trimmedIdToFull.get(packageId) ?? packageId,
      versionName: sortingVersionToVersionName(sortingVersion),
    }));
  }

  groupVersions(versions: PackageVersion[]) {
    return versions.reduce<Record<string, string[]>>((out, { packageId, versionName }) => {
      (out[packageId] ??= []).push(versionName);
      return out;
    }, {});
  }

  versionsGroupToSelector(versionMap: Record<string, string[]>) {
    return Object.entries(versionMap)
      .map(([packageId, versions]) => {
        const versionSelectors = formatQueryList("Name", Array.from(new Set(versions)));

        return `(PackageManager__Package__r.PackageManager__Metadata_Package_Id__c IN ('${escapeSoql(
          trimTo15(packageId)
        )}','${escapeSoql(packageId)}') AND ${versionSelectors})`;
      })
      .join(" OR ");
  }

  async getAuthorityPackageDetails(
    authorityUsername: string,
    versionGroups: readonly PackageVersion[][]
  ): Promise<AuthorityPackageVersion[][]> {
    if (versionGroups.length === 0) {
      return [];
    }

    const versionsGroup = this.groupVersions(versionGroups.flat());
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

    // const packageToGroup = new TwoKeyedRecordArray<number>();
    const packageToGroup: Record<string, Record<string, number[]>> = {};

    versionGroups.forEach((versions, groupIndex) => {
      versions.forEach(({ packageId, versionName }) => {
        ((packageToGroup[packageId] ??= {})[versionName] ??= []).push(groupIndex);
      });
    });

    const out: AuthorityPackageVersion[][] = versionGroups.map(() => []);
    latestVersionsDetails.forEach((version) => {
      const rawPackageId =
        version.PackageManager__Package__r.PackageManager__Metadata_Package_Id__c;
      const packageId = trimmedIdToFull.get(rawPackageId) ?? rawPackageId;
      const versionName = version.Name;

      const packageData = {
        packageId,
        versionName,
        packageName: version.PackageManager__Package__r.Name,
        namespace: version.PackageManager__Package__r.PackageManager__Namespace_Prefix__c,
        buildDate: version.PackageManager__Build_Date__c,
        packageVersionId: version.PackageManager__Metadata_Package_Version_Id__c,
        password: version.PackageManager__Password__c,
        sortingVersion: version.PackageManager__Sorting_Version_Number__c,
      };

      packageToGroup[packageId][versionName].forEach((groupIndex) =>
        out[groupIndex].push(packageData)
      );
    });

    return out;
  }

  async createPackagesInstallRequests(
    username: string,
    packageVersions: AuthorityPackageVersion[]
  ): Promise<PackageInstallRequest[]> {
    const connection = await this.cache.getConnection(username);

    const metadata: PackageInstallRequestMetadata[] = packageVersions.map(
      ({ packageVersionId, password }) => ({
        NameConflictResolution: "Block",
        SecurityType: "Full",
        SubscriberPackageVersionKey: packageVersionId,
        Password: password,
      })
    );

    const results = await connection.tooling.sobject("PackageInstallRequest").create(metadata);
    const resultArray = "length" in results ? results : [results];

    const errorResults = resultArray.filter(isNotSuccess);
    if (errorResults.length > 0) {
      throw new Error(errorResults.flatMap(({ errors }) => errors).join());
    }

    return (resultArray as SuccessResult[]).map(({ id: requestId }, index) => ({
      requestId,
      packageVersion: packageVersions[index],
      status: "pending",
    }));
  }

  async installPackageMetadata(
    username: string,
    packageVersions: AuthorityPackageVersion[]
  ): Promise<void> {
    const connection = await this.cache.getConnection(username);

    const metadata = packageVersions.map(
      ({ namespace, versionName, password }) => ({
        fullName: namespace,
        activateRSS: false,
        versionNumber: versionName,
        password,
      })
    );

    await connection.metadata.upsert("InstalledPackage", metadata);
  }

  async checkPackageInstallRequests(
    username: string,
    requests: PackageInstallRequest[]
  ): Promise<PackageInstallRequest[]> {
    const connection = await this.cache.getConnection(username);

    const requestIds = requests
      .filter(({ status }) => status === "pending")
      .map(({ requestId }) => requestId);

    const results = await connection.tooling.query<PackageInstallRequestMetadata>(
      `SELECT Id, Status FROM PackageInstallRequest WHERE ${formatQueryList("Id", requestIds)}`
    );

    const resultsMap = new Map<string, PackageInstallRequestMetadata>(
      results.records.map((result) => [result.Id!!, result])
    );

    return requests.map((request) => {
      const nextStatus = resultsMap.get(request.requestId)?.Status;

      return nextStatus === undefined
        ? request
        : {
            ...request,
            status: metadataStatusMap[nextStatus],
          };
    });
  }
}

const metadataStatusMap = {
  IN_PROGRESS: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const;

function isNotSuccess(result: RecordResult): result is ErrorResult {
  return !result.success;
}

// Singletons ftw
export const packageManager = new PackageManager(orgCache);

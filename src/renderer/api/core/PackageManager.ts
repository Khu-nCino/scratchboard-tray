import { shrink as strip } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { formatQueryList } from "./util";

export interface PackageVersion {
  readonly namespace: string;
  readonly versionName: string;
}

export interface SortingPackageVersion {
  readonly namespace: string;
  readonly sortingVersion: string;
}

export interface SubscriberPackageVersion extends PackageVersion {}

export interface AuthorityPackageVersion extends PackageVersion {
  readonly packageId: string;
  readonly password: string;
  readonly buildDate: string;
  readonly sortingVersion: string;
}

const installedPackageVersionsQuery = strip`
SELECT
  SubscriberPackage.NamespacePrefix,
  SubscriberPackageVersion.Name
FROM
  InstalledSubscriberPackage
`;

export class PackageManager {
  constructor(private cache: OrgCache) {}

  async listSubscriberPackageVersions(username: string): Promise<SubscriberPackageVersion[]> {
    interface RawInstalledSubscriberPackage {
      readonly SubscriberPackage: {
        readonly NamespacePrefix: string;
      };
      readonly SubscriberPackageVersion: {
        readonly Name: string;
      };
    }

    const versions = await this.cache.query<RawInstalledSubscriberPackage>(
      username,
      installedPackageVersionsQuery,
      true
    );
    return versions.map((version) => ({
      namespace: version.SubscriberPackage.NamespacePrefix,
      versionName: version.SubscriberPackageVersion.Name,
    }));
  }

  getLatestAvailablePackageVersions(
    authorityUsername: string,
    namespaces: string[]
  ): Promise<SortingPackageVersion[]> {
    return this.cache.query<SortingPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c namespace,
          MAX(PackageManager__Sorting_Version_Number__c) sortingVersion
        FROM
          PackageManager__Package_Version__c
        WHERE
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c IN (${formatQueryList(
            namespaces
          )})
          AND PackageManager__Install_URL__c != null
          AND PackageManager__Is_Beta__c = false
          AND PackageManager__Is_Patch__c = false
        GROUP BY PackageManager__Package__r.PackageManager__Namespace_Prefix__c
      `
    );
  }

  // TODO optimize query
  async getAuthorityPackageDetails(
    authorityUsername: string,
    versions: (SortingPackageVersion | SubscriberPackageVersion)[]
  ): Promise<AuthorityPackageVersion[]> {
    const versionSelector = versions
      .map(
        (version) => strip`(
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c = '${version.namespace}'
          AND ${
            "sortingVersion" in version
              ? `PackageManager__Sorting_Version_Number__c = '${version.sortingVersion}'`
              : `Name = '${version.versionName}'`
          }
        )`
      )
      .join(" OR ");

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
          ${versionSelector}
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

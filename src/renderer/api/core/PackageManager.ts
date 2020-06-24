import { shrink as strip } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { formatQueryList } from "./util";

export interface PackageVersion {
  readonly namespace: string;
  readonly version: string;
}

export interface SubscriberPackageVersion extends PackageVersion {}

export interface AuthorityPackageVersion extends PackageVersion {
  readonly sortingVersion: string;
  readonly password: string;
  readonly buildDate: string;
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
      version: version.SubscriberPackageVersion.Name,
    }));
  }

  getLatestAvailablePackageVersions(
    authorityUsername: string,
    namespaces: string[]
  ): Promise<AuthorityPackageVersion[]> {
    return this.cache.query<AuthorityPackageVersion>(
      authorityUsername,
      strip`
        SELECT
          PackageManager__Package__r.PackageManager__Namespace_Prefix__c namespace,
          MAX(PackageManager__Sorting_Version_Number__c) sortingVersion,
          MAX(Name) version,
          MAX(PackageManager__Password__c) password,
          MAX(PackageManager__Build_Date__c) buildDate
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
}

// I'm not happy with this but don't want to take the time to fix it ;(
export const packageManager = new PackageManager(orgCache);

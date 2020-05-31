// saving this query for later

"SELECT Id, SubscriberPackageId, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name, " +
  "SubscriberPackageVersion.Id, SubscriberPackageVersion.Name, SubscriberPackageVersion.MajorVersion, SubscriberPackageVersion.MinorVersion, " +
  "SubscriberPackageVersion.PatchVersion, SubscriberPackageVersion.BuildNumber FROM InstalledSubscriberPackage " +
  "ORDER BY SubscriberPackageId";

function getQuery(packageNames: string[]) {
  const formattedNames = packageNames.map((name) => `'${name}'`).join(",");

  return `
    SELECT
      PackageManager__Package__r.PackageManager__Namespace_Prefix__c namespace,
      MAX(PackageManager__Sorting_Version_Number__c) version,
      MAX(PackageManager__Password__c) password
    FROM
      PackageManager__Package_Version__c
    WHERE
      PackageManager__Package__r.PackageManager__Namespace_Prefix__c IN (${formattedNames})
      AND PackageManager__Install_URL__c != null
      AND PackageManager__Is_Beta__c = false
      AND PackageManager__Is_Patch__c = false
    GROUP BY PackageManager__Package__r.PackageManager__Namespace_Prefix__c
  `;
}

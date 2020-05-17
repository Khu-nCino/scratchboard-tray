import { SalesforceOrg } from "./sfdx";
import { manager } from "./OrgManager";

export function validInstanceUrl(str: string): boolean {
  return Boolean(str);
}

export function coerceInstanceUrl(url: string): string {
  return url.startsWith("https://") ? url : `https://${url}`;
}

export function urlToFrontDoorUrl(orgs: SalesforceOrg[], rawUrl: string): Promise<string> {
  const url = new URL(rawUrl);
  const orgUsername = matchOrgByUrl(orgs, url)?.username;
  if (!orgUsername) {
    throw "Could not find org matching that url.";
  }

  // correct visualforce namespace
  const namespace = extractNamespace(url);
  let correctedPathname =
    url.pathname.startsWith("/apex/") && namespace && !/__/.test(url.pathname)
      ? `/apex/${namespace}__${url.pathname.slice(6)}`
      : url.pathname;

  const urlPath = `${correctedPathname}${url.search}${url.hash}`;

  return manager.getFrontDoor(orgUsername, urlPath);
}

function matchOrgByUrl(orgs: SalesforceOrg[], url: URL) {
  return orgs.find(
    (org) => extractUrlIdentifier(new URL(org.instanceUrl)) === extractUrlIdentifier(url)
  );
}

function extractNamespace(url: URL): string | undefined {
  return (url.hostname.match(/--([a-z]+)/) || [])[1];
}

function extractUrlIdentifier(url: URL): string {
  return url.hostname.split(/\.|--/)[0];
}

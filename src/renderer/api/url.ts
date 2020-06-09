import { SalesforceOrg } from "./SalesforceOrg";
import { orgManager } from "./core/OrgManager";

export function coerceInstanceUrl(url: string): string {
  const trimmedUrl = url.trim();
  return trimmedUrl.startsWith("https://") ? trimmedUrl : `https://${trimmedUrl}`;
}

export function formatFrontDoorUrl(
  instanceUrl: string,
  accessToken: string,
  startUrl?: string
): string {
  const cleanInstanceUrl = instanceUrl.endsWith("/")
    ? instanceUrl.substring(0, instanceUrl.length - 1)
    : instanceUrl;
  const frontDoorUrl = `${cleanInstanceUrl}/secur/frontdoor.jsp?sid=${accessToken}`;

  if (startUrl) {
    const cleanStartUrl = encodeURIComponent(decodeURIComponent(startUrl));
    return `${frontDoorUrl}&retURL=${cleanStartUrl}`;
  }
  return frontDoorUrl;
}

export function urlToFrontDoorUrl(username: string, rawUrl: string): Promise<string> {
  const url = new URL(rawUrl);

  // correct visualforce namespace
  const namespace = extractNamespace(url);
  let correctedPathname =
    url.pathname.startsWith("/apex/") && namespace && !/__/.test(url.pathname)
      ? `/apex/${namespace}__${url.pathname.slice(6)}`
      : url.pathname;

  const urlPath = `${correctedPathname}${url.search}${url.hash}`;

  return orgManager.getFrontDoor(username, urlPath);
}

export function matchOrgByUrl(orgs: SalesforceOrg[], url: string): SalesforceOrg[] {
  return orgs.filter(
    (org) =>
      extractUrlIdentifier(new URL(org.instanceUrl)) ===
      extractUrlIdentifier(new URL(coerceInstanceUrl(url)))
  );
}

function extractNamespace(url: URL): string | undefined {
  return (url.hostname.match(/--([a-z]+)/) || [])[1];
}

function extractUrlIdentifier(url: URL): string {
  return url.hostname.split(/\.|--/)[0];
}

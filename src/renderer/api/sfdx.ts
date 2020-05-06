import fs from "fs";
import path from "path";
import { executePromiseJson } from "./util";

export type SalesforceOrg = NonScratchOrg | ScratchOrg;

export interface BaseOrg {
  username: string;
  orgId: string;
  accessToken: string;
  instanceUrl: string;
  alias: string;
  lastUsed: string;
  isDevHub: boolean;
}

export interface NonScratchOrg extends BaseOrg {
  isScratchOrg: false;
}

export interface ScratchOrg extends BaseOrg {
  isScratchOrg: true;
  devHubUsername: string;
  orgName: string;
  status: string;
  createdBy: string;
  createdDate: string;
  expirationDate: string;
  edition: string;
  signupUsername: string;
  devHubOrgId: string;
  isExpired: boolean;
}

interface OrgListResult {
  nonScratchOrgs: SalesforceOrg[];
  scratchOrgs: ScratchOrg[];
}

export async function listOrgs(): Promise<SalesforceOrg[]> {
  const { nonScratchOrgs, scratchOrgs }: OrgListResult = await executeSfdxCommand("org:list");

  nonScratchOrgs.forEach((org) => {
    org.isScratchOrg = false;
  });

  scratchOrgs.forEach((org) => {
    org.isScratchOrg = true;
  });

  return [...nonScratchOrgs, ...scratchOrgs];
}

export function openOrg(username: string): Promise<void> {
  return executeSfdxCommand("org:open", {
    "-u": username,
  });
}

export function frontDoorUrlApi(username: string, startUrl?: string): Promise<string> {
  return executeSfdxCommand("org:open", {
    "-r": true,
    "-u": username,
    "-p": startUrl,
  }).then((result) => result.url);
}

export function deleteOrg(username: string): Promise<void> {
  return executeSfdxCommand("org:delete", {
    "-p": true,
    "-u": username,
  });
}

export function setAlias(username: string, alias: string): Promise<void> {
  return executeSfdxCommand("alias:set", {
    [alias]: username,
  });
}

export function logoutOrg(username: string): Promise<void> {
  return executeSfdxCommand("auth:logout", {
    "-p": true,
    "-u": username,
  });
}

// Returns cancel callback
export function loginOrg(
  instanceUrl: string,
  alias?: string
): {
  promise: Promise<void>;
  cancel: () => void;
} {
  const params: CommandParams = {
    "-r": `https://${instanceUrl}`,
    "-a": alias,
  };
  return executePromiseJson(`sfdx force:auth:web:login --json${buildParams(params)}`);
}

function executeSfdxCommand(command: string, params?: CommandParams): Promise<any> {
  return executePromiseJson(`sfdx force:${command} --json${buildParams(params)}`).promise;
}

type CommandParams = Record<string, string | boolean | undefined>;

function buildParams(params?: CommandParams): string {
  if (params === undefined) {
    return "";
  }

  return Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== false)
    .reduce((acc, [k, v]) => acc + (v === true ? ` "${k}"` : ` "${k}"="${v}"`), "");
}

const binaryName = process.platform === "win32" ? "sfdx.exe" : "sfdx";

export function validateSfdxPath(sfdxBinPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (sfdxBinPath && path.basename(sfdxBinPath).startsWith(binaryName)) {
      fs.stat(sfdxBinPath, (error, state) => {
        resolve(!Boolean(error) && state.isFile());
      });
    } else {
      resolve(false);
    }
  });
}

// TODO Find us a good home
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

  return frontDoorUrlApi(orgUsername, urlPath);
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

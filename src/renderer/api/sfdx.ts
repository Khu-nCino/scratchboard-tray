import path from "path";
import fs from "fs";
import { executePromiseJson } from "./util";

export interface SalesforceOrg {
  username: string;
  orgId: string;
  accessToken: string;
  instanceUrl: string;
  loginUrl: string;
  clientId: string;
  alias: string;
  lastUsed: string;
  connectedStatus: string;
}

export interface ScratchOrg extends SalesforceOrg {
  createdOrgInstance: string;
  created: string;
  devHubUsername: string;
  connectedStatus: string;
  attributes: {
    type: string;
    url: string;
  };
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
  scratchOrgs: ScratchOrg[];
}

export function listScratchOrgs(): Promise<ScratchOrg[]> {
  return executePromiseJson("sfdx force:org:list --json").then(
    (orgList: OrgListResult) => orgList.scratchOrgs
  );
}

export function openOrg(username: string): Promise<void> {
  return executePromiseJson(`sfdx force:org:open --json -u ${username}`);
}

export function frontDoorUrlApi(username: string): Promise<string> {
  return executePromiseJson(`sfdx force:org:open --json -r -u ${username}`).then((result) => result.url);
}

export function deleteOrg(username: string): Promise<void> {
  return executePromiseJson(`sfdx force:org:delete --json -p -u ${username}`);
}

export function setAlias(username: string, alias: string): Promise<void> {
  return executePromiseJson(`sfdx force:alias:set "${alias}"=${username} --json`)
}

export function validateSfdxPath(sfdxDir: string): Promise<boolean> {
  return new Promise((resolve) => {
    const sfdxFilePath = path.join(sfdxDir, 'sfdx'); //TODO this is os specific

    fs.stat(sfdxFilePath, (error, state) => {
      resolve(!Boolean(error) && state.isFile());
    });
  });
}

import fs from "fs";
import path from "path";
import { executePromiseJson } from "./util";

export type SalesforceOrg = NonScratchOrg | ScratchOrg;

export interface BaseOrg {
  username: string;
  orgId: string;
  accessToken: string;
  instanceUrl: string;
  alias?: string;
  isDevHub: boolean;
}

export interface NonScratchOrg extends BaseOrg {
  isScratchOrg: false;
}

export interface ScratchOrg extends BaseOrg {
  isScratchOrg: true;
  devHubUsername: string;
  expirationDate: string;
}

export async function deleteOrg(username: string): Promise<void> {
  return executeSfdxCommand("org:delete", {
    "-p": true,
    "-u": username,
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
    "-r": instanceUrl,
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

const binaryName = "sfdx";

export function validateSfdxPath(sfdxBinPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (sfdxBinPath && path.basename(sfdxBinPath).startsWith(binaryName)) {
      fs.stat(sfdxBinPath, (error, state) => {
        resolve(!error && state.isFile());
      });
    } else {
      resolve(false);
    }
  });
}

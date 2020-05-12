import fs from "fs";
import path from "path";
import { ipcRenderer } from "electron";
import { AuthInfo, Aliases, AliasGroup, Connection } from "@salesforce/core";
import { executePromiseJson } from "./util";
import { IpcRendererEvent } from "common/IpcEvent";

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

export async function listOrgs(): Promise<SalesforceOrg[]> {
  const authFileNames = await AuthInfo.listAllAuthFiles();
  const usernames = authFileNames.map((fileName) => fileName.substring(0, fileName.length - 5)); // remove .json
  const authInfos = await Promise.all(usernames.map((username) => AuthInfo.create({ username })));

  const aliases = await Aliases.create(Aliases.getDefaultOptions());
  const orgAliases = Object.entries(aliases.getGroup(AliasGroup.ORGS)!!).reduce<
    Record<string, string>
  >((acc, [alias, username]) => {
    acc[`${username}`] = alias;
    return acc;
  }, {});

  return authInfos
    .filter((info) => {
      // filter expired orgs
      const expirationDate = info.getFields().expirationDate;
      return !expirationDate || Date.parse(expirationDate) > Date.now();
    })
    .map((info) => {
      const fields = info.getFields();
      if (fields.expirationDate) {
        return {
          isDevHub: false,
          isScratchOrg: true,
          username: fields.username!!,
          accessToken: fields.accessToken!!,
          alias: fields.alias || orgAliases[fields.username!!],
          devHubUsername: fields.devHubUsername!!,
          orgId: fields.orgId!!,
          instanceUrl: fields.instanceUrl!!,
          expirationDate: fields.expirationDate,
        };
      } else {
        return {
          isDevHub: fields.isDevHub!!,
          isScratchOrg: false,
          username: fields.username!!,
          accessToken: fields.accessToken!!,
          alias: fields.alias || orgAliases[fields.username!!],
          instanceUrl: fields.instanceUrl!!,
          orgId: fields.orgId!!,
        };
      }
    });
}

export async function openOrg(username: string): Promise<void> {
  ipcRenderer.send(IpcRendererEvent.OPEN_EXTERNAL, await createFrontDoor(username));
}

export async function createFrontDoor(username: string, startUrl?: string): Promise<string> {
  const conn = await Connection.create({ authInfo: await AuthInfo.create({ username }) });

  const accessToken = conn.accessToken;
  const instanceUrl = conn.getAuthInfoFields().instanceUrl;

  const frontDoorUrl = `${instanceUrl}/secur/frontdoor.jsp?sid=${accessToken}`;

  if (startUrl) {
    const cleanStartUrl = encodeURIComponent(decodeURIComponent(startUrl));
    return `${frontDoorUrl}&retURL=${cleanStartUrl}`;
  }
  return frontDoorUrl;
}

export async function deleteOrg(username: string): Promise<void> {
  return executeSfdxCommand("org:delete", {
    "-p": true,
    "-u": username,
  });
}

export async function setAlias(username: string, newAlias?: string): Promise<void> {
  const aliases = await Aliases.create(Aliases.getDefaultOptions());

  const [ oldAlias ] = Object.entries(aliases.getGroup(AliasGroup.ORGS)!!).find(
    ([_, name]) => name === username
  ) ?? [ undefined ];


  if (newAlias) {
    aliases.set(newAlias, username);
  }
  if (oldAlias) {
    aliases.unset(oldAlias);
  }
  aliases.write();
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

import { AliasGroup, Org, AuthInfo, Connection } from "@salesforce/core";
import { Emitter } from "common/Emitter";
import { OrgCache } from "./OrgCache";
import { SalesforceOrg } from "./sfdx";

export class OrgManager {
  orgDataChangeEvent = new Emitter<{ changed: SalesforceOrg[]; removed: string[] }>();
  private cache = new OrgCache();

  constructor() {
    this.cache.orgChangeEvent.addListener(async ({ added, removed }) => {
      const addedInfos = await Promise.all(
        added.map((username) => this.cache.getAuthInfo(username))
      );

      const active = addedInfos.filter(isActive);
      const formattedAdded = await this.formatOrgData(active);
      this.orgDataChangeEvent.emit({ changed: formattedAdded, removed });

      //const missingExpirationDates
      // TODO
    });
  }

  checkOrgChanges() {
    return this.cache.checkOrgChanges();
  }

  async setAlias(username: string, newAlias?: string): Promise<void> {
    const aliases = await this.cache.getAliases();
    const orgAliases = aliases.getGroup(AliasGroup.ORGS)!!;

    const [oldAlias] = Object.entries(orgAliases).find(([_, name]) => name === username) ?? [
      undefined,
    ];

    if (newAlias) {
      aliases.set(newAlias, username);
    }
    if (oldAlias) {
      aliases.unset(oldAlias);
    }
    await aliases.write();
  }

  async getFrontDoor(username: string, startUrl?: string): Promise<string> {
    const org = await this.cache.getOrg(username);
    await org.refreshAuth();

    const instanceUrl = `${org.getField(Org.Fields.INSTANCE_URL)}`;
    const accessToken = org.getConnection().accessToken;

    return formatFrontdoorUrl(instanceUrl, accessToken, startUrl);
  }

  async formatOrgData(authInfos: AuthInfo[]): Promise<SalesforceOrg[]> {
    const usernameAliasMap = await this.getUsernameAliasMap();

    return authInfos.map((info) => {
      const fields = info.getFields();
      const alias = fields.alias || usernameAliasMap.get(fields.username!!) || "";
      if (fields.devHubUsername) {
        return {
          isDevHub: false,
          isScratchOrg: true,
          username: fields.username!!,
          accessToken: fields.accessToken!!,
          alias,
          devHubUsername: fields.devHubUsername!!,
          orgId: fields.orgId!!,
          instanceUrl: fields.instanceUrl!!,
          expirationDate: fields.expirationDate!!,
        };
      } else {
        return {
          isDevHub: fields.isDevHub ?? false,
          isScratchOrg: false,
          username: fields.username!!,
          accessToken: fields.accessToken!!,
          alias,
          instanceUrl: fields.instanceUrl!!,
          orgId: fields.orgId!!,
        };
      }
    });
  }

  private async populateExpirationDates(authInfos: AuthInfo[]): Promise<void> {
    const connections = await this.groupByDevHubConnection(authInfos);

    const results = await Promise.all(
      connections.map(async ([connection, infos]) => {
        const formattedUsernames = infos.map((info) => info.getFields().username!!).join(",");
        const results = await connection.query(
          `SELECT Username,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg IN (${formattedUsernames})`
        );
        return results.records as { Username: string; ExpirationDate: string }[];
      })
    );

    const expirationDates = results.flat().reduce<Record<string, string>>((acc, { Username, ExpirationDate }) => {
      acc[Username] = ExpirationDate;
      return acc;
    }, {});

    for (const info of authInfos) {
      const fields = info.getFields();
      fields.expirationDate = expirationDates[fields.username!!];
      info.save(fields);
    }
  }

  private async getUsernameAliasMap(): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    const aliases = await this.cache.getAliases();
    for (const [alias, username] of Object.entries(aliases.getGroup(AliasGroup.ORGS)!!)) {
      out.set(`${username}`, alias);
    }
    return out;
  }

  private groupByDevHubConnection(authInfos: AuthInfo[]): Promise<[Connection, AuthInfo[]][]> {
    const groups: Record<string, AuthInfo[]> = {};

    for (const authInfo of authInfos) {
      const username = authInfo.getFields().devHubUsername;
      if (username) {
        (groups[username] ?? (groups[username] = [])).push(authInfo);
      }
    }

    return Promise.all(
      Object.entries(groups).map(
        async ([devHub, group]) =>
          [await this.cache.getConnection(devHub), group] as [Connection, AuthInfo[]]
      )
    );
  }
}

function isScratch(info: AuthInfo) {
  return info.getFields().devHubUsername;
}

function isActive(info: AuthInfo) {
  const expirationDate = info.getFields().expirationDate;
  return !isScratch(info) || !expirationDate || Date.parse(expirationDate) > Date.now();
}

function formatFrontdoorUrl(instanceUrl: string, accessToken: string, startUrl?: string): string {
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

export const manager = new OrgManager();
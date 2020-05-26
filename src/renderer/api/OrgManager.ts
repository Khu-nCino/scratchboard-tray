import { AliasGroup, Org, AuthInfo, Connection, AuthFields } from "@salesforce/core";
import { Emitter } from "common/Emitter";
import { getLogger } from "common/logger";
import { binaryGroups, notUndefined } from "common/util";
import { OrgCache, readOrgGroupReverse } from "./OrgCache";
import { SalesforceOrg } from "./sfdx";

const logger = getLogger();
export class OrgManager {
  orgDataChangeEvent = new Emitter<{ changed: SalesforceOrg[]; removed: string[] }>();
  syncErrorEvent = new Emitter<{ name: string; detail: Error }>();
  private cache = new OrgCache();

  constructor() {
    this.cache.syncErrorEvent.addListener((event) => this.syncErrorEvent.emit(event));

    this.cache.aliasChangeEvent.addListener(async ({ changed }) => {
      const infos = await Promise.all(
        changed.map((username) => this.cache.getCachedAuthInfo(username)).filter(notUndefined)
      );
      if (infos.length > 0) {
        this.orgDataChangeEvent.emit({
          changed: await this.formatDescriptions(infos),
          removed: [],
        });
      }
    });

    this.cache.orgChangeEvent.addListener(async ({ added, removed }) => {
      try {
        const addedInfos = await this.cache.getAllAuthInfo(added);
        const active = addedInfos.filter(isActive);

        if (active.length > 0 || removed.length > 0) {
          const formattedAdded = await this.formatDescriptions(active);
          this.cache.clearCaches(removed);
          this.orgDataChangeEvent.emit({ changed: formattedAdded, removed });

          const missingExpirationDates = active.filter((org) => {
            const field = org.getFields();
            return field.devHubUsername && !field.expirationDate;
          });
          if (missingExpirationDates.length > 0) {
            await this.populateExpirationDates(missingExpirationDates);

            const [notExpured, expired] = binaryGroups(
              missingExpirationDates,
              (info) => Date.parse(info.getFields().expirationDate!!) > Date.now()
            );
            const expiredUsernames = expired.map((info) => info.getFields().username!!);
            this.cache.clearCaches(expiredUsernames);

            this.orgDataChangeEvent.emit({
              changed: await this.formatDescriptions(notExpured),
              removed: expiredUsernames,
            });
          }
        }
      } catch (error) {
        logger.error(error.detail ?? error);
        this.syncErrorEvent.emit({ name: "Data sync error", detail: error });
      }
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

  logoutOrg(username: string): Promise<void> {
    return this.cache.deleteData(username);
  }

  async deleteScratchOrg(username: string): Promise<void> {
    const orgInfo = await this.cache.getAuthInfo(username);
    const devHubUsername = orgInfo.getFields().devHubUsername;
    if (devHubUsername === undefined) {
      throw new Error(`Can't delete scratchOrg no devhub for ${username}`);
    }


    const devHubConn = await this.cache.getConnection(devHubUsername);
    await devHubConn
      .sobject("ActiveScratchOrg")
      .delete(await this.queryOrgId(devHubConn, username));
    await this.cache.deleteData(username);
  }

  async formatDescriptions(authInfos: AuthInfo[]): Promise<SalesforceOrg[]> {
    const usernameAliasMap = readOrgGroupReverse(await this.cache.getAliases());

    return authInfos.map((info) => {
      const fields = info.getFields();
      const alias = fields.alias || usernameAliasMap[fields.username!!] || "";
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

  private async queryOrgId(devHubConn: Connection, username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      devHubConn.query(
        `SELECT Id FROM ActiveScratchOrg WHERE SignupUsername = '${username}'`,
        {},
        (err, result) => {
          if (err) {
            reject(err);
          }
          const records = result.records as { Id: string }[];
          if (records.length !== 1) {
            reject(new Error(`Couldn't identify org to delete from username: ${username}`));
          }
          resolve(records[0].Id);
        }
      );
    });
  }

  private async populateExpirationDates(authInfos: AuthInfo[]): Promise<void> {
    const connections = await this.groupByDevHubConnection(authInfos);

    const results = await Promise.all(
      connections.map(
        ([connection, infos]) =>
          new Promise<{ SignupUsername: string; ExpirationDate: string }[]>((resolve, reject) => {
            const formattedUsernames = infos
              .map((info) => `'${info.getFields().username}'`)
              .join(",");
            connection.query(
              `SELECT SignupUsername,ExpirationDate FROM ActiveScratchOrg WHERE SignupUsername IN (${formattedUsernames})`,
              { autoFetch: true },
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result.records as { SignupUsername: string; ExpirationDate: string }[]);
                }
              }
            );
          })
      )
    );

    const expirationDates = results
      .flat()
      .reduce<Record<string, string>>((acc, { SignupUsername, ExpirationDate }) => {
        acc[SignupUsername] = ExpirationDate;
        return acc;
      }, {});

    await Promise.all(
      authInfos.map((info) => {
        const fields: AuthFields = info.getFields();
        return info.save({ expirationDate: expirationDates[fields.username!!] });
      })
    );
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

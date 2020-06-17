import { AliasGroup, Org, AuthInfo, Connection, AuthFields } from "@salesforce/core";
import { Emitter } from "common/Emitter";
import { getLogger } from "common/logger";
import { binaryGroups, notUndefined } from "common/util";
import { OrgCache, orgCache } from "./OrgCache";
import { SalesforceOrg } from "../SalesforceOrg";
import { formatFrontDoorUrl } from "../url";
import { isActive, readOrgGroupReverse, trimTo15, formatQueryList } from "./util";

const logger = getLogger();
export class OrgManager {
  orgDataChangeEvent = new Emitter<{ changed: SalesforceOrg[]; removed: string[] }>();
  syncErrorEvent = new Emitter<{ name: string; detail: Error }>();

  constructor(private cache: OrgCache) {
    this.cache.syncErrorEvent.addListener((event) => this.syncErrorEvent.emit(event));
    this.cache.aliasChangeEvent.addListener(this.handleAliasChangeEvent.bind(this));
    this.cache.orgChangeEvent.addListener(this.handleOrgChangeEvent.bind(this));
  }

  async handleAliasChangeEvent({ changed }: { changed: string[] }) {
    const infos = await Promise.all(
      changed.map((username) => this.cache.getCachedAuthInfo(username)).filter(notUndefined)
    );
    if (infos.length > 0) {
      this.orgDataChangeEvent.emit({
        changed: await this.formatDescriptions(infos),
        removed: [],
      });
    }
  }

  async handleOrgChangeEvent({ added, removed }: { added: string[]; removed: string[] }) {
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

          const [notExpured, expired] = binaryGroups(missingExpirationDates, (info) => {
            const expirationDate = info.getFields().expirationDate;
            return expirationDate !== undefined && Date.parse(expirationDate) > Date.now();
          });
          const expiredUsernames = expired
            .map((info) => info.getFields().username)
            .filter(notUndefined);
          this.cache.clearCaches(expiredUsernames, true);

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
  }

  checkOrgChanges(): Promise<void> {
    return this.cache.checkOrgChanges();
  }

  async setAlias(username: string, newAlias?: string): Promise<void> {
    const aliases = await this.cache.getAliases();
    const orgAliases = aliases.getGroup(AliasGroup.ORGS);

    if (orgAliases !== undefined) {
      const oldAliasNames = Object.entries(orgAliases)
        .filter(([_, name]) => name === username)
        .map(([alias]) => alias);

      if (oldAliasNames.length > 0) {
        aliases.unsetAll(oldAliasNames);
      }
    }

    if (newAlias) {
      aliases.set(newAlias, username);
    }
    await aliases.write();
  }

  async getFrontDoor(username: string, startUrl?: string): Promise<string> {
    const org = await this.cache.getOrg(username);
    await org.refreshAuth();

    const instanceUrl = `${org.getField(Org.Fields.INSTANCE_URL)}`;
    const accessToken = org.getConnection().accessToken;

    return formatFrontDoorUrl(instanceUrl, accessToken, startUrl);
  }

  logoutOrg(username: string): Promise<void> {
    return this.cache.deleteData(username);
  }

  async deleteScratchOrg(username: string): Promise<void> {
    const orgInfo = await this.cache.getAuthInfo(username);
    const { orgId, devHubUsername } = orgInfo.getFields();
    if (devHubUsername === undefined) {
      throw new Error(`Can't delete scratchOrg no devhub for ${username}`);
    }

    const devHubConn = await this.cache.getConnection(devHubUsername);
    await devHubConn.sobject("ActiveScratchOrg").delete(await this.queryOrgId(devHubConn, orgId!));
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
          scratchAdminUsername: fields.scratchAdminUsername,
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

  private async queryOrgId(devHubConn: Connection, orgId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      devHubConn.query(
        `SELECT Id FROM ActiveScratchOrg WHERE ScratchOrg = '${trimTo15(orgId)}'`,
        {},
        (err, result) => {
          if (err) {
            reject(err);
          }
          const records = result.records as { Id: string }[];
          if (records.length !== 1) {
            reject(new Error("Couldn't identify single org to delete"));
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
          new Promise<{ username: string; expirationDate: string }[]>((resolve, reject) => {
            const orgIdToUsername = infos.reduce<Record<string, string>>((acc, info) => {
              const { orgId, username } = info.getFields();
              acc[trimTo15(orgId!)] = username!;
              return acc;
            }, {});

            const formatedOrgIds = formatQueryList(Object.keys(orgIdToUsername));

            connection.query(
              `SELECT ScratchOrg,ExpirationDate FROM ActiveScratchOrg WHERE ScratchOrg IN (${formatedOrgIds})`,
              { autoFetch: true },
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  const records = result.records as {
                    ScratchOrg: string;
                    ExpirationDate: string;
                  }[];

                  resolve(
                    records.map(({ ScratchOrg, ExpirationDate }) => ({
                      username: orgIdToUsername[ScratchOrg],
                      expirationDate: ExpirationDate,
                    }))
                  );
                }
              }
            );
          })
      )
    );

    const expirationDates = results
      .flat()
      .reduce<Record<string, string>>((acc, { username, expirationDate }) => {
        acc[username] = expirationDate;
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

export const orgManager = new OrgManager(orgCache);

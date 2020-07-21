import { AuthInfo, Aliases, Connection, Org, AliasGroup } from "@salesforce/core";
import { arrayDiff, notUndefined, notConcurrent } from "common/util";
import { CachedResource } from "common/CachedResource";
import { Emitter } from "common/Emitter";
import { getLogger } from "common/logger";
import { readOrgGroup, compareAliases, authFileName2Username } from "./util";

export type OrgListChangeListener = (added: string[], removed: string[]) => void;
export type AliasChangeListener = () => void;

const logger = getLogger();
export class OrgCache {
  orgChangeEvent = new Emitter<{ added: string[]; removed: string[] }>();
  aliasChangeEvent = new Emitter<{ changed: string[] }>();
  syncErrorEvent = new Emitter<{ name: string; detail: Error }>();

  private currentUsernames: string[] = [];
  private currentAliases: Record<string, string> = {};

  private authInfoCache = new CachedResource((username: string) => AuthInfo.create({ username }));
  private connectionCache = new CachedResource(async (username) =>
    Connection.create({ authInfo: await this.authInfoCache.get(username) })
  );
  private orgCache = new CachedResource(async (username) =>
    Org.create({ connection: await this.connectionCache.get(username) })
  );

  private aliases?: Promise<Aliases>;

  getAuthInfo(username: string): Promise<AuthInfo> {
    return this.authInfoCache.get(username);
  }

  getCachedAuthInfo(username: string): Promise<AuthInfo> | undefined {
    return this.authInfoCache.getCached(username);
  }

  getConnection(username: string): Promise<Connection> {
    return this.connectionCache.get(username);
  }

  getOrg(username: string): Promise<Org> {
    return this.orgCache.get(username);
  }

  async getAllAuthInfo(usernames: string[]): Promise<AuthInfo[]> {
    return (
      await Promise.all(
        usernames.map(async (username) => {
          try {
            return await this.getAuthInfo(username);
          } catch (error) {
            logger.error(error.detail ?? error);
            this.syncErrorEvent.emit({ name: "Data sync error", detail: error });
            return;
          }
        })
      )
    ).filter(notUndefined);
  }

  getAliases(reload: boolean = false): Promise<Aliases> {
    return this.aliases === undefined || reload
      ? (this.aliases = Aliases.create(Aliases.getDefaultOptions()))
      : this.aliases;
  }

  async setAlias(username: string, newAlias?: string): Promise<void> {
    const aliases = await this.getAliases();
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

  async resolveAlias(aliasOrUsername: string): Promise<string> {
    const aliases = await this.getAliases();
    return aliases.get(aliasOrUsername)?.toString() ?? aliasOrUsername;
  }

  checkOrgChanges = notConcurrent(async () => {
    await this.checkAliasChanges();

    let nextUsernames: string[] = [];
    try {
      nextUsernames = (await AuthInfo.listAllAuthFiles()).map(authFileName2Username);
    } catch (error) {
      if (error.name !== "NoAuthInfoFound") {
        logger.error(error.detail ?? error);
        this.syncErrorEvent.emit({ name: "Data sync error", detail: error });
        return;
      }
    }

    const { added, removed } = arrayDiff(nextUsernames, this.currentUsernames);
    this.currentUsernames = nextUsernames;

    if (added.length > 0 || removed.length > 0) {
      try {
        await this.orgChangeEvent.emit({ added, removed });
      } catch (error) {
        logger.error(error.detail ?? error);
        this.syncErrorEvent.emit({ name: "Data sync error", detail: error });
      }
    }
  });

  async addData(authInfo: AuthInfo) {
    const username = authInfo.getFields().username;
    if (!username) {
      throw new Error("No username found on authInfo");
    }
    if (this.currentUsernames.includes(username)) {
      throw new Error(`Username: ${username} already registered. Please log out of the org first.`);
    }

    this.currentUsernames.push(username);

    const resultAuth = await authInfo.save();
    this.authInfoCache.set(username, Promise.resolve(resultAuth));
    this.orgChangeEvent.emit({ added: [username], removed: [] });
  }

  async removeOrg(username: string): Promise<void> {
    const org = await this.getOrg(username);
    const usernames = (await org.readUserAuthFiles())
      .map((auth) => auth.getUsername())
      .filter(notUndefined);
    await org.remove(true);
    
    this.clearCaches(usernames);
    this.orgChangeEvent.emit({ added: [], removed: usernames });
  }

  clearCaches(usernames: string[], preventReload: boolean = false): boolean {
    return usernames.reduce<boolean>(
      (acc, username) => acc || this.clearCache(username, preventReload),
      false
    );
  }

  clearCache(username: string, preventReload: boolean = false): boolean {
    if (!preventReload) {
      this.currentUsernames = this.currentUsernames.filter(
        (currentUsername) => currentUsername !== username
      );
    }
    return (
      AuthInfo.clearCache(username) ||
      this.authInfoCache.delete(username) ||
      this.connectionCache.delete(username) ||
      this.orgCache.delete(username)
    );
  }

  async getDevHubUsername(username: string): Promise<string> {
    const { devHubUsername } = (await this.getAuthInfo(username)).getFields();
    if (devHubUsername === undefined) {
      throw new Error(`No devHubUsername found for ${username}`);
    }
    return devHubUsername;
  }

  async query<T>(usernameOrAlias: string, query: string, tooling: boolean = false): Promise<T[]> {
    logger.log(`Executing Query ORG: "${usernameOrAlias}", QUERY: "${query}"`);
    const connection = await this.getConnection(await this.resolveAlias(usernameOrAlias));

    return new Promise((resolve, reject) => {
      (tooling ? connection.tooling : connection).query<T>(query, {}, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.records);
        }
      });
    });
  }

  async queryDevHub<T>(username: string, query: string, tooling: boolean = false): Promise<T[]> {
    const devHubUsername = await this.getDevHubUsername(username);
    return this.query(devHubUsername, query, tooling);
  }

  private async checkAliasChanges() {
    const aliases = await this.getAliases(true);

    const nextAliases = readOrgGroup(aliases);

    const changed = compareAliases(nextAliases, this.currentAliases);
    this.currentAliases = nextAliases;
    this.aliasChangeEvent.emit({ changed });
  }
}

export const orgCache = new OrgCache();

import path from "path";
import { AuthInfo, Aliases, Connection, Org, Global, fs } from "@salesforce/core";
import { arrayDiff, notUndefined, notConcurrent } from "common/util";
import { CachedResource } from "common/CachedResource";
import { Emitter } from "common/Emitter";
import { getLogger } from "common/logger";
import { readOrgGroup, compareAliases, authFileName2Username, readOrgGroupReverse } from "./util";

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

  checkOrgChanges = notConcurrent(async () => {
    try {
      await this.checkAliasChanges();

      const nextUsernames = (await AuthInfo.listAllAuthFiles()).map(authFileName2Username);
      const { added, removed } = arrayDiff(nextUsernames, this.currentUsernames);
      this.currentUsernames = nextUsernames;

      if (added.length > 0 || removed.length > 0) {
        await this.orgChangeEvent.emit({ added, removed });
      }
    } catch (error) {
      logger.error(error.detail ?? error);
      this.syncErrorEvent.emit({ name: "Data sync error", detail: error });
    }
  });

  async deleteData(username: string): Promise<void> {
    const aliases = await this.getAliases(true);
    const reverseOrgGroup = readOrgGroupReverse(aliases);
    const alias: string | undefined = reverseOrgGroup[username];
    if (alias) {
      aliases.unset(alias);
      await aliases.write();
      this.currentAliases = readOrgGroup(aliases);
    }

    this.clearCache(username);
    await fs.unlink(path.join(Global.DIR, `${username}.json`));
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

  private async checkAliasChanges() {
    const aliases = await this.getAliases(true);

    const nextAliases = readOrgGroup(aliases);

    const changed = compareAliases(nextAliases, this.currentAliases);
    this.currentAliases = nextAliases;
    this.aliasChangeEvent.emit({ changed });
  }
}

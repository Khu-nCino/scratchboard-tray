import { AuthInfo, Aliases, Connection, Org, AliasGroup } from "@salesforce/core";
import { arrayDiff } from "common/util";
import { CachedResource } from "common/CachedResource";
import { Emitter } from "common/Emitter";
import { getLogger } from "common/logger";

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

  getAliases(reload: boolean = false): Promise<Aliases> {
    return this.aliases === undefined || reload
      ? (this.aliases = Aliases.create(Aliases.getDefaultOptions()))
      : this.aliases;
  }

  checkOrgChanges = notConcurrent(async () => {
    try {
      await this.checkAliasChanges();

      const nextUsernames = (await AuthInfo.listAllAuthFiles()).map(authFileName2username);
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

  clearCache(username: string): boolean {
    this.currentUsernames = this.currentUsernames.filter(
      (currentUsername) => currentUsername !== username
    );
    return (
      this.authInfoCache.delete(username) ||
      this.connectionCache.delete(username) ||
      this.orgCache.delete(username)
    );
  }

  private async checkAliasChanges() {
    const aliases = await this.getAliases(true);

    const orgGroup = aliases.getGroup(AliasGroup.ORGS)!!;
    const nextAliases = Object.entries(orgGroup).reduce<Record<string, string>>(
      (acc, [alias, username]) => {
        acc[alias] = `${username}`;
        return acc;
      },
      {}
    );

    const changed = compareAliases(nextAliases, this.currentAliases);
    this.currentAliases = nextAliases;
    this.aliasChangeEvent.emit({ changed });
  }
}

// util

function compareAliases(
  nextAliases: Record<string, string>,
  oldAliases: Record<string, string>
): string[] {
  const changedUsernames: string[] = [];

  // Added or changed
  for (const [alias, username] of Object.entries(nextAliases)) {
    if (!(alias in oldAliases) || oldAliases[alias] !== username) {
      changedUsernames.push(username);
      changedUsernames.push(oldAliases[alias]);
    }
  }

  // Removed aliases
  for (const [alias, username] of Object.entries(nextAliases)) {
    if (!(alias in oldAliases)) {
      changedUsernames.push(username);
    }
  }

  return changedUsernames;
}

function authFileName2username(filename: string): string {
  return filename.substring(0, filename.length - 5);
}

function notConcurrent<T>(proc: () => PromiseLike<T>) {
  let inFlight: Promise<T> | false = false;

  return () => {
    if (!inFlight) {
      inFlight = (async () => {
        try {
          return await proc();
        } finally {
          inFlight = false;
        }
      })();
    }
    return inFlight;
  };
}

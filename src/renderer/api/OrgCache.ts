import { AuthInfo, Aliases, Connection, Org } from "@salesforce/core";
import { arrayDiff } from "common/util";
import { CachedResource } from "common/CachedResource";
import { Emitter } from "common/Emitter";

export type OrgListChangeListener = (added: string[], removed: string[]) => void;
export type AliasChangeListener = () => void;

export class OrgCache {
  orgChangeEvent = new Emitter<{ added: string[]; removed: string[] }>();
  aliasChangeEvent = new Emitter();

  private currentUsernames: string[] = [];

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

  getConnection(username: string): Promise<Connection> {
    return this.connectionCache.get(username);
  }

  getOrg(username: string): Promise<Org> {
    return this.orgCache.get(username);
  }

  getAliases(): Promise<Aliases> {
    return this.aliases ?? (this.aliases = Aliases.create(Aliases.getDefaultOptions()));
  }

  checkOrgChanges = notConcurrent(async () => {
    const nextUsernames = (await AuthInfo.listAllAuthFiles()).map(authFileName2username);
    const { added, removed } = arrayDiff(nextUsernames, this.currentUsernames);
    this.currentUsernames = nextUsernames;

    if (added.length > 0 || removed.length > 0) {
      await this.orgChangeEvent.emit({ added, removed });
    }
  });

  async checkAliases() {}

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
}

// util

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

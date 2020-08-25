import { Aliases, AliasGroup, AuthInfo } from "@salesforce/core";

export function readOrgGroup(aliases: Aliases): Record<string, string> {
  const orgsGroup = aliases.getGroup(AliasGroup.ORGS);
  if (orgsGroup === undefined) {
    return {};
  }

  return Object.entries(orgsGroup).reduce<Record<string, string>>((acc, [alias, username]) => {
    acc[alias] = `${username}`;
    return acc;
  }, {});
}

export function readOrgGroupReverse(aliases: Aliases): Record<string, string> {
  const orgsGroup = aliases.getGroup(AliasGroup.ORGS);
  if (orgsGroup === undefined) {
    return {};
  }

  return Object.entries(orgsGroup).reduce<Record<string, string>>((acc, [alias, username]) => {
    acc[`${username}`] = alias;
    return acc;
  }, {});
}

export function compareAliases(
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

export function authFileName2Username(filename: string): string {
  return filename.substring(0, filename.length - 5);
}

export function trimTo15(orgId: string) {
  if (orgId !== null && orgId !== undefined && orgId.length && orgId.length > 15) {
    orgId = orgId.substring(0, 15);
  }

  return orgId;
}

export function formatQueryList(field: string, items: string[]): string {
  if (items.length < 1) {
    throw new Error("Need items for a format query");
  } else if (items.length === 1) {
    return `${escapeSoql(field)} = '${escapeSoql(items[0])}'`;
  } else {
    return `${escapeSoql(field)} IN (${items.map((item) => `'${escapeSoql(item)}'`).join()})`;
  }
}

export function escapeSoql(str: string) {
  return str.replace(/'/g, "\\'");
}

export function isScratch(info: AuthInfo) {
  return info.getFields().devHubUsername;
}

export function isActive(info: AuthInfo) {
  const expirationDate = info.getFields().expirationDate;
  return !isScratch(info) || !expirationDate || Date.parse(expirationDate) > Date.now();
}

export function compareVersions(a?: string, b?: string): -1 | 0 | 1 | undefined {
  if (a === undefined || b === undefined) {
    return undefined;
  }

  const aList = a.split(".").map(Number);
  const bList = b.split(".").map(Number);

  const length = Math.min(aList.length, bList.length);
  for (let i = 0; i < length; i++) {
    if (aList[i] > bList[i]) {
      return 1;
    } else if (aList[i] < bList[i]) {
      return -1;
    }
  }

  if (aList.length > bList.length) {
    return 1;
  } else if (aList.length < bList.length) {
    return -1;
  }
  return 0;
}

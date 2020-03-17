const deliminator = process.platform === "win32" ? ";" : ":";

export function getCurrentPaths(): string[] {
  return process.env.PATH?.split(deliminator) ?? [];
}

export function setPaths(paths: string[]) {
  process.env.PATH = Array.from(new Set(paths))
    .sort()
    .filter(p => Boolean(p))
    .join(deliminator);
}

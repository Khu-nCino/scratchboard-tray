export function getCurrentPaths(): string[] {
  return process.env.PATH?.split(":") ?? [];
}

export function setPaths(paths: string[]) {
  process.env.PATH = Array.from(new Set(paths)).join(":");
}

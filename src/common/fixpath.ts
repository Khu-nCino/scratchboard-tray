const pathsToAdd = [
  "/Users/gabrielkeith/.nvm/versions/node/v10.18.1/bin",
  "/usr/local/bin"
];

export default function fixPath() {
  if (process.platform === "darwin") {
    const currentPaths = process.env.PATH?.split(":") ?? [];
    const pathSet = new Set(pathsToAdd);

    process.env.PATH = [
      ...pathsToAdd,
      ...currentPaths.filter(p => !pathSet.has(p))
    ].join(":");
  }
}

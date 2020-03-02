import { exec, ExecOptions } from "child_process";

export function executePromiseJson(
  command: string,
  path?: string
): Promise<any> {
  const options: ExecOptions = {};

  if (path) {
    options.cwd = path;
  }

  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout) => {
      if (!error) {
        try {
          resolve(JSON.parse(stdout).result);
        } catch (exception) {
          reject(exception);
        }
      } else {
        reject(error.message);
      }
    });
  });
}

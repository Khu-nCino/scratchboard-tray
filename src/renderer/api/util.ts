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
      if (error) {
        reject(error);
        return;
      }

      try {
        const output = JSON.parse(stdout);
        if (output.status === 0) {
          resolve(output.result);
        } else {
          reject(output.message);
        }
      } catch (exception) {
        reject(exception);
      }
    });
  });
}

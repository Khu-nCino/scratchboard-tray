import { exec, ExecOptions } from "child_process";
import { getLogger } from "common/logger";

const logger = getLogger();

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
        logger.error(error.message);
        reject(error.message);
        return;
      }

      try {
        const output = JSON.parse(stdout);
        if (output.status === 0) {
          resolve(output.result);
        } else {
          logger.error(output.message);
          reject(output.message);
        }
      } catch (exception) {
        logger.error(exception);
        reject(exception);
      }
    });
  });
}

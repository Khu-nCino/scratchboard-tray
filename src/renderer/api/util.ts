import { ExecOptions, ChildProcess, exec } from "child_process";
import { getLogger } from "common/logger";

const logger = getLogger();

export function executePromiseJson(
  command: string,
  path?: string
): { promise: Promise<any>; cancel: () => void } {
  const options: ExecOptions = {
    windowsHide: true,
  };

  if (path) {
    options.cwd = path;
  }

  let isCanceled = false;
  let childProcess: ChildProcess | undefined;

  return {
    cancel: () => {
      isCanceled = true;
      childProcess?.kill();
    },
    promise: new Promise((resolve, reject) => {
      if (isCanceled) {
        return;
      }

      logger.debug(`Executing: ${command}`);
      childProcess = exec(command, options, (error, stdout) => {
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
    }),
  };
}

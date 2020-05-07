import { ExecOptions, ChildProcess, exec } from "child_process";
import { getLogger } from "common/logger";

const logger = getLogger();

export class ExecutionError extends Error {
  constructor(message: string, public command: string) {
    super(message);
    this.name = "ExecutionError";
  }
}

export class CanceledExecutionError extends ExecutionError {
  constructor(command: string) {
    super("Canceled Execution", command);
    this.name = "CanceledExecutionError";
  }
}

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
        reject(new CanceledExecutionError(command));
      }

      logger.debug(`Executing: ${command}`);
      childProcess = exec(command, options, (error, stdout) => {
        if (error) {
          if (error.killed) {
            reject(new CanceledExecutionError(command));
            return;
          }

          logger.error(error.message);
          reject(new ExecutionError(error.message, command));
          return;
        }

        try {
          const output = JSON.parse(stdout);
          if (output.status === 0) {
            resolve(output.result);
          } else {
            logger.error(output.message);
            reject(new ExecutionError(output.message, command));
          }
        } catch (exception) {
          logger.error(exception);
          reject(new ExecutionError(exception, command));
        }
      });
    }),
  };
}

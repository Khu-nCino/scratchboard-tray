import { ExecOptions, ChildProcess, exec } from "child_process";
import { getLogger } from "common/logger";

const logger = getLogger();

export class ExecutionError extends Error {
  constructor(message: string, public command: string) {
    super(message);
    this.name = "ExecutionError";
  }

  toString(): string {
    return `${this.command} - ${this.message}`;
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
        try {
          const output = JSON.parse(stdout);
          if (output.status === 0) {
            resolve(output.result);
          } else {
            const e = new ExecutionError(output.message, command);
            logger.error(e.toString());
            reject(e);
          }
        } catch (exception) {
          if (error) {
            if (error.killed) {
              reject(new CanceledExecutionError(command));
              return;
            }

            const e = new ExecutionError(error.message, command);
            logger.error(e.toString());
            reject(e);
            return;
          } else {
            const e = new ExecutionError(exception, command);
            logger.error(e.toString());
            reject(e);
          }
        }
      });
    }),
  };
}

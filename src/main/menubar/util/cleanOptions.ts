/**
 * @ignore
 */

/** */

import { Options } from "../types";

/**
 * Take as input some options, and return a sanitized version of it.
 *
 * @param opts - The options to clean.
 * @ignore
 */
export function cleanOptions(opts?: Partial<Options>): Options {
  const options: Partial<Options> = { ...opts };
  options.loadUrlOptions = options.loadUrlOptions || {};
  options.tooltip = options.tooltip || "";

  return options as Options;
}

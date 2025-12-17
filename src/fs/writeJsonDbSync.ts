import { stringifyJson } from "@rsc-utils/core-utils";
import { writeFileSync } from "./writeFileSync.js";

/**
 * Designed for writing a .json.db file that is a list of json items on each line, but not an array.
 */
export function writeJsonDbSync<T>(filePathAndName: string, values: T[], options?: { makeDir?:boolean; }): boolean {
	const content = values.map(value => stringifyJson(value)).join("\n");
	return writeFileSync(filePathAndName, content, options);
}

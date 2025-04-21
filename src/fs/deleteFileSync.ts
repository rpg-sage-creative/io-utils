import { rmSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
import { error } from "@rsc-utils/core-utils";

/**
 * Returns true if the file didn't exist or rmSync didn't throw errors.
 * Returns false if an error was thrown.
 */
export function deleteFileSync(path: string): boolean;

/**
 * Returns "NotFound" if the file didn't exist (counts as truthy for if the file was deleted).
 * Returns true if the file existed *and* was deleted.
 * Returns false if the file wasn't deleted.
 */
export function deleteFileSync(path: string, options: { checkExists:true; }): "NotFound" | boolean;

export function deleteFileSync(path: string, options?: { checkExists:true; }): "NotFound" | boolean {
	if (options?.checkExists && !fileExistsSync(path)) {
		return "NotFound";
	}
	let deleted = false;
	try {
		rmSync(path, { force:true });
		deleted = true;
	}catch(ex) {
		error(ex);
		return false;
	}
	return options?.checkExists
		? !fileExistsSync(path)
		: deleted;
}

import { errorReturnFalse } from "@rsc-utils/core-utils";
import { rm } from "fs";
import { fileExists } from "./fileExists.js";

/**
 * Returns true if the file didn't exist or rmSync didn't throw errors.
 * Returns false if an error was thrown.
 */
export function deleteFile(path: string): Promise<boolean>;

/**
 * Returns "NotFound" if the file didn't exist (counts as truthy for if the file was deleted).
 * Returns true if the file existed *and* was deleted.
 * Returns false if the file wasn't deleted.
 */
export function deleteFile(path: string, options: { checkExists:true; }): Promise<"NotFound" | boolean>;

export async function deleteFile(path: string, options?: { checkExists:true; }): Promise<"NotFound" | boolean> {
	if (options?.checkExists) {
		const exists = await fileExists(path);
		if (!exists) return "NotFound"; // NOSONAR
	}

	const deleted = await new Promise<boolean>(res => rm(path, { force:true }, () => res(true))).catch(errorReturnFalse);

	if (options?.checkExists) {
		const exists = await fileExists(path);
		return !exists;
	}

	return deleted;
}

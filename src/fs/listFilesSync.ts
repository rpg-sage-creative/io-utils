import { error } from "@rsc-utils/core-utils";
import { readdirSync } from "fs";
import { createExtFilter } from "./internal/createExtFilter.js";

/**
 * Lists all the filenames found in the given path.
 */
export function listFilesSync(path: string): string[];

/**
 * Lists all the filenames found in the given path that have the given extension.
 */
export function listFilesSync(path: string, ext: string): string[];

export function listFilesSync(path: string, ext?: string): string[] {
	try {
		const files = readdirSync(path);
		if (ext) {
			return files.filter(createExtFilter(ext));
		}
		return files;
	}catch(ex) {
		error(ex);
	}
	return [];
}

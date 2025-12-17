import { writeFileSync as fsWriteFileSync, mkdirSync } from "node:fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";

/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export function writeFileSync<T>(filePathAndName: string, content: T, options?: { makeDir?:boolean; formatted?:boolean; }): boolean {
	if (options?.makeDir) {
		mkdirSync(toFilePath(filePathAndName), { recursive:true });
	}

	fsWriteFileSync(filePathAndName, contentToFileOutput(content, options?.formatted));

	return true;
}

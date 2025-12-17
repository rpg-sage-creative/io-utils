import { writeFileSync as fsWriteFileSync, mkdirSync } from "node:fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";

type Options = { makeDir?:boolean; formatted?:boolean; };

/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export function writeFileSync<T>(filePathAndName: string, content: T, options?: Options): boolean {
	if (options?.makeDir) {
		mkdirSync(toFilePath(filePathAndName), { recursive:true });
	}

	fsWriteFileSync(filePathAndName, contentToFileOutput(content, options?.formatted));

	return true;
}

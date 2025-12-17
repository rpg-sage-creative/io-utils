import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileExistsSync } from "./fileExistsSync.js";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";

type Options = { makeDir?:boolean; };

/** Appends the given content to the given file path/name, optionally building the path if it doesn't exist. */
export function appendJsonDbSync<T>(filePathAndName: string, content: T, options?: Options): boolean {
	if (options?.makeDir) {
		mkdirSync(toFilePath(filePathAndName), { recursive:true });
	}
	const exists = fileExistsSync(filePathAndName);
	if (exists) {
		appendFileSync(filePathAndName, "\n" + contentToFileOutput(content));
	}else {
		writeFileSync(filePathAndName, contentToFileOutput(content));
	}
	return true;
}
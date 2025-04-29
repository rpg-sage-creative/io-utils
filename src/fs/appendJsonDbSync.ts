import { appendFileSync, mkdirSync, writeFileSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";

/** Appends the given content to the given file path/name, optionally building the path if it doesn't exist. */
export function appendJsonDbSync<T>(filePathAndName: string, content: T, makeDir?: boolean): boolean {
	if (makeDir) {
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
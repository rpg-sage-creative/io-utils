import { writeFile as fsWriteFile } from "fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
import { makeDir } from "./makeDir.js";

/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export async function writeFile<T>(filePathAndName: string, content: T, options?: { makeDir?:boolean; formatted?:boolean; }): Promise<boolean> {
	if (options?.makeDir) {
		await makeDir(toFilePath(filePathAndName));
	}

	return new Promise((resolve, reject) =>
		fsWriteFile(filePathAndName, contentToFileOutput(content, options?.formatted), error =>
			error ? reject(error) : resolve(true)
		)
	);
}

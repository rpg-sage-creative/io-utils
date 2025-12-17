import { writeFile as fsWriteFile } from "node:fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
import { makeDir } from "./makeDir.js";
export async function writeFile(filePathAndName, content, options) {
    if (options?.makeDir) {
        await makeDir(toFilePath(filePathAndName));
    }
    return new Promise((resolve, reject) => fsWriteFile(filePathAndName, contentToFileOutput(content, options?.formatted), error => error ? reject(error) : resolve(true)));
}

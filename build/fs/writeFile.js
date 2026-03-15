import { writeFile as fsWriteFile } from "node:fs";
import { dirname } from "node:path";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { makeDir } from "./makeDir.js";
export async function writeFile(filePath, content, options) {
    if (options?.makeDir) {
        const dirPath = dirname(filePath);
        await makeDir(dirPath);
    }
    return new Promise((resolve, reject) => fsWriteFile(filePath, contentToFileOutput(content, options?.formatted), error => error ? reject(error) : resolve(true)));
}

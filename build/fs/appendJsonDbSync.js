import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileExistsSync } from "./fileExistsSync.js";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
export function appendJsonDbSync(filePath, content, options) {
    if (options?.makeDir) {
        const dirPath = dirname(filePath);
        mkdirSync(dirPath, { recursive: true });
    }
    const exists = fileExistsSync(filePath);
    if (exists) {
        appendFileSync(filePath, "\n" + contentToFileOutput(content));
    }
    else {
        writeFileSync(filePath, contentToFileOutput(content));
    }
    return true;
}

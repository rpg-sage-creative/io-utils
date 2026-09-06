import { writeFileSync as fsWriteFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export function writeFileSync(filePath, content, options) {
    if (options?.makeDir) {
        const dirPath = dirname(filePath);
        mkdirSync(dirPath, { recursive: true });
    }
    fsWriteFileSync(filePath, contentToFileOutput(content, options?.formatted));
    return true;
}

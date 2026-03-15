import { writeFileSync as fsWriteFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
export function writeFileSync(filePath, content, options) {
    if (options?.makeDir) {
        const dirPath = dirname(filePath);
        mkdirSync(dirPath, { recursive: true });
    }
    fsWriteFileSync(filePath, contentToFileOutput(content, options?.formatted));
    return true;
}

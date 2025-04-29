import { writeFileSync as fsWriteFileSync, mkdirSync } from "fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
export function writeFileSync(filePathAndName, content, options) {
    if (options?.makeDir) {
        mkdirSync(toFilePath(filePathAndName), { recursive: true });
    }
    fsWriteFileSync(filePathAndName, contentToFileOutput(content, options?.formatted));
    return true;
}

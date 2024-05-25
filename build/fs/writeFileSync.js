import { error } from "@rsc-utils/core-utils";
import { writeFileSync as fsWriteFileSync, mkdirSync } from "fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
export function writeFileSync(filePathAndName, content, makeDir, formatted) {
    try {
        if (makeDir) {
            mkdirSync(toFilePath(filePathAndName), { recursive: true });
        }
    }
    catch (ex) {
        error(ex);
    }
    try {
        fsWriteFileSync(filePathAndName, contentToFileOutput(content, formatted));
    }
    catch (ex) {
        error(ex);
        return false;
    }
    return true;
}

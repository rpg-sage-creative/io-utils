import { appendFileSync, mkdirSync, writeFileSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
export function appendJsonDbSync(filePathAndName, content, makeDir) {
    if (makeDir) {
        mkdirSync(toFilePath(filePathAndName), { recursive: true });
    }
    const exists = fileExistsSync(filePathAndName);
    if (exists) {
        appendFileSync(filePathAndName, "\n" + contentToFileOutput(content));
    }
    else {
        writeFileSync(filePathAndName, contentToFileOutput(content));
    }
    return true;
}

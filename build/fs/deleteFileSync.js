import { rmSync } from "node:fs";
import { fileExistsSync } from "./fileExistsSync.js";
export function deleteFileSync(path, options) {
    const checkExists = options?.checkExists ?? false;
    const checkBefore = checkExists === true || checkExists === "before";
    if (checkBefore) {
        const exists = fileExistsSync(path);
        // no file means exit early
        if (!exists) {
            return "NotFound";
        }
    }
    // allow force to be passed in, default to true
    const force = options?.force ?? true;
    // attempt to delete
    rmSync(path, { force });
    // check again to be sure
    const checkAfter = checkExists === true || checkExists === "after";
    if (checkAfter) {
        return !fileExistsSync(path);
    }
    // assume all went well
    return true;
}

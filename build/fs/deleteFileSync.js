import { rmSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
export function deleteFileSync(path, options) {
    const checkExists = options?.checkExists ?? false;
    const checkBefore = checkExists === true || checkExists === "before";
    if (checkBefore) {
        const exists = fileExistsSync(path);
        if (!exists) {
            return "NotFound";
        }
    }
    const force = options?.force ?? true;
    rmSync(path, { force });
    const checkAfter = checkExists === true || checkExists === "after";
    if (checkAfter) {
        return !fileExistsSync(path);
    }
    return true;
}

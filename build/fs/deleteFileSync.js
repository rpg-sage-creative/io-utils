import { rmSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
import { error } from "@rsc-utils/core-utils";
export function deleteFileSync(path, options) {
    if (options?.checkExists && !fileExistsSync(path)) {
        return "NotFound";
    }
    let deleted = false;
    try {
        rmSync(path, { force: true });
        deleted = true;
    }
    catch (ex) {
        error(ex);
        return false;
    }
    return options?.checkExists
        ? !fileExistsSync(path)
        : deleted;
}

import { errorReturnFalse } from "@rsc-utils/core-utils";
import { rm } from "fs";
import { fileExists } from "./fileExists.js";
export async function deleteFile(path, options) {
    if (options?.checkExists) {
        const exists = await fileExists(path);
        if (!exists)
            return "NotFound";
    }
    const deleted = await new Promise(res => rm(path, { force: true }, () => res(true))).catch(errorReturnFalse);
    if (options?.checkExists) {
        const exists = await fileExists(path);
        return !exists;
    }
    return deleted;
}

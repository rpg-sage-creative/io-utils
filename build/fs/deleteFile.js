import { rm } from "node:fs";
import { fileExists } from "./fileExists.js";
export function deleteFile(path, options) {
    return new Promise(async (resolve, reject) => {
        const checkExists = options?.checkExists ?? false;
        const checkBefore = checkExists === true || checkExists === "before";
        if (checkBefore) {
            const exists = await fileExists(path).catch(reject);
            // no file means exit early
            if (!exists) {
                // we resolve "NotFound"
                if (exists === false)
                    resolve("NotFound"); // NOSONAR
                // exit early (we rejected fileExists)
                return;
            }
        }
        // allow force to be passed in, default to true
        const force = options?.force ?? true;
        // attempt to delete
        const deleted = await new Promise((res, rej) => rm(path, { force }, err => err ? rej(err) : res(true))).catch(reject);
        // we failed to delete (and already rejected), no need to look for file
        if (deleted !== true) {
            return;
        }
        // check again to be sure
        const checkAfter = checkExists === true || checkExists === "after";
        if (checkAfter) {
            const exists = await fileExists(path).catch(reject);
            // let's resolve if we didn't already reject
            if (exists !== undefined) {
                resolve(!exists);
            }
            return;
        }
        // assume all went well
        resolve(deleted);
    });
}

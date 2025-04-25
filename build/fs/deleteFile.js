import { rm } from "fs";
import { fileExists } from "./fileExists.js";
export function deleteFile(path, options) {
    return new Promise(async (resolve, reject) => {
        const checkExists = options?.checkExists ?? false;
        const checkBefore = checkExists === true || checkExists === "before";
        if (checkBefore) {
            const exists = await fileExists(path).catch(reject);
            if (!exists) {
                if (exists === false)
                    resolve("NotFound");
                return;
            }
        }
        const force = options?.force ?? true;
        const deleted = await new Promise((res, rej) => rm(path, { force }, err => err ? rej(err) : res(true))).catch(reject);
        if (deleted !== true) {
            return;
        }
        const checkAfter = checkExists === true || checkExists === "after";
        if (checkAfter) {
            const exists = await fileExists(path).catch(reject);
            if (exists !== undefined) {
                resolve(!exists);
            }
            return;
        }
        resolve(deleted);
    });
}

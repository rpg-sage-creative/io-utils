import { exists } from "node:fs";
export function fileExists(path) {
    return new Promise((resolve, reject) => {
        try {
            exists(path, resolve);
        }
        catch (ex) {
            reject(ex);
        }
    });
}

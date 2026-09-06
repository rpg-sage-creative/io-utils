import { parseJson } from "@rsc-utils/core-utils";
import { readText } from "./readText.js";
/**
 * Convenience for: readTextFile(path).then(json => parse(json));
 * An error while parsing will be rejected.
 * Rejections from readTextFile and readFile are bubbled.
 */
export function readJsonFile(path) {
    return new Promise((resolve, reject) => {
        readText(path).then(json => {
            let object;
            try {
                object = parseJson(json);
            }
            catch (ex) {
                reject(ex);
            }
            if (object !== undefined) {
                resolve(object);
            }
            else {
                // In case we didn't reject an exception somehow, we don't want the Promise to hang ...
                reject("Unable to parse!");
            }
        }, reject);
    });
}

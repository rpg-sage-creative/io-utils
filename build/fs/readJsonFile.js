import { parseJson } from "@rsc-utils/core-utils";
import { readText } from "./readText.js";
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
                reject("Unable to parse!");
            }
        }, reject);
    });
}

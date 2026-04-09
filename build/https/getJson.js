import { parseJson, verbose } from "@rsc-utils/core-utils";
import { getText } from "./getText.js";
export function getJson(url, postData, opts) {
    return new Promise((resolve, reject) => {
        const options = { ...opts };
        options.headers = {
            "Accept": "application/json, */*",
            ...options.headers
        };
        getText(url, postData, options).then(text => {
            try {
                resolve(parseJson(text));
            }
            catch (ex) {
                if (text === "Internal Server Error") {
                    reject(text);
                }
                else {
                    verbose(text?.slice(0, 50) + "...");
                    reject(ex);
                }
            }
        }, reject);
    });
}

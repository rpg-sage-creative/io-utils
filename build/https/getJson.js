import { parse, verbose } from "@rsc-utils/core-utils";
import { getText } from "./getText.js";
export function getJson(url, postData) {
    return new Promise((resolve, reject) => {
        getText(url, postData).then(text => {
            try {
                resolve(parse(text));
            }
            catch (ex) {
                if (text === "Internal Server Error") {
                    reject(text);
                }
                else {
                    verbose(text);
                    reject(ex);
                }
            }
        }, reject);
    });
}

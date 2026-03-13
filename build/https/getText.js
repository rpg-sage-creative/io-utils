import { getBuffer } from "./getBuffer.js";
export function getText(url, postData, opts) {
    return new Promise((resolve, reject) => {
        getBuffer(url, postData, opts).then(buffer => {
            try {
                resolve(buffer.toString("utf8"));
            }
            catch (ex) {
                reject(ex);
            }
        }, reject);
    });
}

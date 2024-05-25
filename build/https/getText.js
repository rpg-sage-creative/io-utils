import { getBuffer } from "./getBuffer.js";
export function getText(url, postData) {
    return new Promise((resolve, reject) => {
        getBuffer(url, postData).then(buffer => {
            try {
                resolve(buffer.toString("utf8"));
            }
            catch (ex) {
                reject(ex);
            }
        }, reject);
    });
}

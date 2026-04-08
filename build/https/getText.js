import { getBuffer } from "./getBuffer.js";
export function getText(url, postData, opts) {
    return new Promise((resolve, reject) => {
        const { bufferEncoding = "utf8", ...options } = opts ?? {};
        getBuffer(url, postData, options).then(buffer => {
            try {
                resolve(buffer.toString(bufferEncoding));
            }
            catch (ex) {
                reject(ex);
            }
        }, reject);
    });
}

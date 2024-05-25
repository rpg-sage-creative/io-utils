import { verbose } from "@rsc-utils/core-utils";
import { getProtocol } from "./getProtocol.js";
export function getFileSize(url) {
    return new Promise(async (resolve, reject) => {
        verbose(`getFileSize: ${url}`);
        const protocol = getProtocol(url);
        const request = protocol.request(url, { method: "HEAD" }, response => {
            try {
                const stringValue = response.headers["content-length"];
                const numberValue = stringValue ? +stringValue : -1;
                const contentLength = isNaN(numberValue) ? -1 : numberValue;
                resolve(contentLength);
            }
            catch (ex) {
                reject(ex);
            }
        });
        request.once("error", reject);
        request.end();
    });
}

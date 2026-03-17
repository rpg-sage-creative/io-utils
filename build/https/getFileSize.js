import { typeError, verbose } from "@rsc-utils/core-utils";
import { getProtocol } from "./getProtocol.js";
export function getFileSize(url) {
    if (typeof (url) !== "string") {
        return Promise.reject(typeError({ argKey: "url", mustBe: "a valid url string", value: url }));
    }
    const { promise, reject: __reject, resolve: __resolve } = Promise.withResolvers();
    let request;
    let response;
    const cleanup = () => {
        response?.removeAllListeners();
        response?.destroy();
        response = null;
        request?.removeAllListeners();
        request?.destroy();
        request = null;
    };
    const resolve = (contentLength) => {
        cleanup();
        __resolve(contentLength);
    };
    const reject = (ev, msg) => {
        cleanup();
        __reject(msg ?? ev);
    };
    try {
        const protocol = getProtocol(url);
        const options = { method: "HEAD" };
        verbose(`${options.method} ${url}`);
        request = protocol.request(url, options, _response => {
            response = _response;
            try {
                const stringValue = response.headers["content-length"];
                const numberValue = stringValue ? +stringValue : -1;
                const contentLength = isNaN(numberValue) ? -1 : numberValue;
                resolve(contentLength);
            }
            catch (ex) {
                reject("try/catch (createStreamFromResponse)", ex);
            }
        });
        request.once("error", reject);
        request.end();
    }
    catch (ex) {
        reject("try/catch (request)", ex);
    }
    return promise;
}

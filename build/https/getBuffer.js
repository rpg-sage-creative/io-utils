import { stringifyJson, verbose } from "@rsc-utils/core-utils";
import { fileExistsSync } from "../fs/fileExistsSync.js";
import { readFile } from "../fs/readFile.js";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";
export function getBuffer(url, postData, opts) {
    if (typeof (url) !== "string") {
        return Promise.reject(new Error("Invalid Url"));
    }
    if (/^file:\/\//i.test(url)) {
        const path = url.slice(6);
        if (fileExistsSync(path)) {
            return readFile(path);
        }
        else {
            return Promise.reject(new Error("Invalid Path"));
        }
    }
    if (!(/^https?:\/\//i).test(url)) {
        url = "https://" + url;
    }
    return new Promise((_resolve, _reject) => {
        let pTracker = opts?.logPercent || opts?.progressTracker ? opts.progressTracker ?? createHttpLogger(`Fetching Bytes: ${url}`, 0) : null;
        const resolve = (buffer) => {
            pTracker?.finish();
            pTracker = null;
            _resolve(buffer);
        };
        const reject = (msg) => {
            pTracker?.error(msg);
            pTracker = null;
            _reject(msg);
        };
        try {
            const protocol = getProtocol(url);
            const method = postData ? "request" : "get";
            const payload = postData ? stringifyJson(postData) : null;
            const options = payload ? {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payload.length,
                },
                method: "POST"
            } : {};
            verbose(`${options?.method ?? "GET"} ${url}`);
            if (options) {
                verbose({ options });
            }
            if (postData) {
                verbose({ postData });
            }
            const req = protocol[method](url, options, response => {
                try {
                    const chunks = [];
                    response.on("data", (chunk) => {
                        pTracker?.increment(chunk.byteLength);
                        chunks.push(chunk);
                    });
                    response.once("close", reject);
                    response.once("end", () => resolve(Buffer.concat(chunks)));
                    response.once("error", reject);
                }
                catch (ex) {
                    reject(ex);
                }
            });
            req.once("response", resp => pTracker?.start(+(resp.headers["content-length"] ?? 0)));
            req.once("close", reject);
            req.once("error", reject);
            req.once("timeout", reject);
            if (method === "request") {
                req.write(payload);
            }
            req.end();
        }
        catch (ex) {
            reject(ex);
        }
    });
}

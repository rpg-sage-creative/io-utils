import { stringifyJson, verbose } from "@rsc-utils/core-utils";
import { pipeline } from "node:stream";
import { createGunzip } from "node:zlib";
import { fileExistsSync } from "../fs/fileExistsSync.js";
import { readFile } from "../fs/readFile.js";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";
export function getBuffer(url, postData, opts) {
    if (typeof (url) !== "string") {
        return Promise.reject(new TypeError("Invalid Url"));
    }
    const urlLower = url.toLowerCase();
    if (urlLower.startsWith("file://")) {
        const path = url.slice(7);
        return fileExistsSync(path)
            ? readFile(path)
            : Promise.reject(new Error("Invalid Path"));
    }
    if (!(urlLower.startsWith("http://") || urlLower.startsWith("https://"))) {
        url = "https://" + url;
    }
    const { promise, reject: __reject, resolve: __resolve } = Promise.withResolvers();
    let request;
    let response;
    let stream;
    let progressTracker = opts?.logPercent || opts?.progressTracker
        ? opts.progressTracker ?? createHttpLogger(`Fetching Bytes: ${url}`, 0)
        : null;
    const cleanup = () => {
        stream?.removeAllListeners();
        stream?.destroy();
        stream = null;
        response?.removeAllListeners();
        response?.destroy();
        response = null;
        request?.removeAllListeners();
        request?.destroy();
        request = null;
        if (progressTracker?.started) {
            progressTracker?.finish();
        }
        progressTracker = null;
    };
    const resolve = (buffer) => {
        cleanup();
        __resolve(buffer);
    };
    const reject = (ev, msg) => {
        cleanup();
        __reject(msg ?? ev);
    };
    try {
        const protocol = getProtocol(url);
        const method = postData ? "request" : "get";
        const payload = postData ? stringifyJson(postData) : null;
        const options = payload ? {
            headers: {
                "Content-Type": "application/json",
                "Content-Length": payload.length,
                "Accept-Encoding": "gzip",
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
        request = protocol[method](url, options, _response => {
            response = _response;
            stream = processResponse({ response, resolve, reject, progressTracker });
        });
        if (opts?.timeout) {
            request.setTimeout(opts.timeout);
        }
        request.once("close", err => reject("request.close", err));
        request.once("error", err => reject("request.error", err));
        request.once("timeout", err => reject("request.timeout", err));
        if (method === "request") {
            request.write(payload);
        }
        request.end();
    }
    catch (ex) {
        reject("try/catch (request)", ex);
    }
    return promise;
}
function processResponse({ response, resolve, reject, progressTracker }) {
    let stream;
    try {
        let rChunks = [];
        if ("content-length" in response.headers) {
            const contentLength = +(response.headers["content-length"] ?? 0);
            progressTracker?.start(contentLength);
        }
        stream = response.headers["content-encoding"] === "gzip"
            ? pipeline(response, createGunzip(), err => err ? reject("stream.gunzip", err) : void (0))
            : response;
        stream.once("close", (err) => reject("stream.close", err));
        stream.on("data", (rChunk) => {
            if (progressTracker?.started) {
                progressTracker?.increment(rChunk.byteLength);
            }
            rChunks?.push(rChunk);
        });
        stream.once("end", () => {
            if (rChunks?.length) {
                const buffer = Buffer.concat(rChunks);
                rChunks = null;
                resolve(buffer);
            }
            else {
                rChunks = null;
                reject("stream.end", "empty buffer");
            }
        });
        stream.once("error", (err) => reject("stream.error", err));
    }
    catch (ex) {
        reject("try/catch (createStreamFromResponse)", ex);
    }
    return stream;
}

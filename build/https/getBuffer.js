import { stringifyJson, typeError, verbose } from "@rsc-utils/core-utils";
import { pipeline } from "node:stream";
import { createBrotliDecompress, createGunzip } from "node:zlib";
import { fileExists } from "../fs/fileExists.js";
import { readFile } from "../fs/readFile.js";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";
export function getBuffer(url, postData, opts) {
    if (typeof (url) !== "string") {
        return Promise.reject(typeError({ argKey: "url", mustBe: "a valid url string", value: url }));
    }
    const urlLower = url.toLowerCase();
    if (urlLower.startsWith("file://")) {
        const path = url.slice(7);
        return fileExists(path).then(exists => exists ? readFile(path) : Promise.reject(new Error("Invalid Path: " + url)), reason => Promise.reject(reason ?? new Error("Invalid Path: " + url)));
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
        __reject(msg ?? `${ev}: ${url}`);
    };
    try {
        const protocol = getProtocol(url, opts?.followRedirects);
        const payload = postData ? stringifyJson(postData) : null;
        const options = payload ? {
            headers: {
                "Accept-Encoding": "gzip",
                "Content-Length": payload.length,
                "Content-Type": "application/json",
                ...opts?.headers,
            },
            method: "POST"
        } : {
            headers: {
                "Accept-Encoding": "gzip, br",
                ...opts?.headers,
            },
            method: "GET"
        };
        verbose(`${options.method} ${url}`);
        if (options) {
            verbose({ options });
        }
        if (postData) {
            verbose({ postData });
        }
        const functionName = postData ? "request" : "get";
        request = protocol[functionName](url, options, _response => {
            response = _response;
            stream = processResponse({ response, resolve, reject, progressTracker });
        });
        if (opts?.timeout) {
            request.setTimeout(opts.timeout);
        }
        request.once("close", err => reject("request.close", err));
        request.once("error", err => reject("request.error", err));
        request.once("timeout", err => reject("request.timeout", err));
        if (payload) {
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
        stream = createStream(response, reject);
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
        reject("try/catch (processResponse)", ex);
    }
    return stream;
}
function createStream(response, reject) {
    const contentEncoding = response.headers["content-encoding"];
    if (contentEncoding === "gzip") {
        return pipeline(response, createGunzip(), err => err ? reject("stream.gunzip", err) : void (0));
    }
    if (contentEncoding === "br") {
        return pipeline(response, createBrotliDecompress(), err => err ? reject("stream.br", err) : void (0));
    }
    return response;
}

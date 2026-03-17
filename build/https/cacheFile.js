import { typeError, verbose } from "@rsc-utils/core-utils";
import { WriteStream, createWriteStream, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { pipeline } from "node:stream";
import { createGunzip } from "node:zlib";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";
export function cacheFile(...args) {
    const opts = typeof (args[args.length - 1]) !== "string"
        ? args.pop()
        : undefined;
    const url = opts?.url ?? args.shift();
    if (typeof (url) !== "string") {
        return Promise.reject(typeError({ argKey: "url", mustBe: "a valid url string", value: url }));
    }
    const filePath = opts?.filePath ?? args.shift();
    if (typeof (filePath) !== "string") {
        return Promise.reject(typeError({ argKey: "filePath", mustBe: "a valid url path string", value: filePath }));
    }
    try {
        const dirPath = dirname(filePath);
        if (!existsSync(dirPath)) {
            verbose(`Creating folder: ${dirPath}`);
            mkdirSync(dirPath, { recursive: true });
        }
        else if (existsSync(filePath)) {
            verbose(`Removing old file: ${filePath}`);
            rmSync(filePath);
        }
    }
    catch (ex) {
        return Promise.reject(ex);
    }
    const { promise, reject: __reject, resolve: __resolve } = Promise.withResolvers();
    let request;
    let response;
    let readStream;
    let writeStream;
    let progressTracker = opts?.logPercent || opts?.progressTracker
        ? opts.progressTracker ?? createHttpLogger(`Fetching Bytes: ${url}`, 0)
        : null;
    const cleanup = () => {
        writeStream?.removeAllListeners();
        writeStream?.destroy();
        writeStream = null;
        readStream?.removeAllListeners();
        readStream?.destroy();
        readStream = null;
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
    const resolve = () => {
        cleanup();
        __resolve(true);
    };
    const reject = (ev, msg) => {
        cleanup();
        __reject(msg ?? ev);
    };
    try {
        const options = {
            headers: {
                "Accept-Encoding": "gzip",
            },
            method: "GET",
        };
        request = getProtocol(url).get(url, options, _response => {
            response = _response;
            ({ readStream, writeStream } = processResponse({ filePath, response, resolve, reject, progressTracker }));
        });
        if (opts?.timeout) {
            request.setTimeout(opts.timeout);
        }
        request.once("close", err => reject("request.close", err));
        request.once("error", err => reject("request.error", err));
        request.once("timeout", err => reject("request.timeout", err));
        request.end();
    }
    catch (ex) {
        reject("try/catch (request)", ex);
    }
    return promise;
}
function processResponse({ filePath, response, resolve, reject, progressTracker }) {
    let readStream;
    let writeStream;
    try {
        if ("content-length" in response.headers) {
            const contentLength = +(response.headers["content-length"] ?? 0);
            progressTracker?.start(contentLength);
        }
        readStream = response.headers["content-encoding"] === "gzip"
            ? pipeline(response, createGunzip(), err => err ? reject("readStream.gunzip", err) : void (0))
            : response;
        readStream.on("data", (rChunk) => {
            if (progressTracker?.started) {
                progressTracker?.increment(rChunk.byteLength);
            }
        });
        readStream.once("error", (err) => reject("readStream.error", err));
        verbose(`Opening file for stream: ${filePath}`);
        writeStream = createWriteStream(filePath, { encoding: "utf8" });
        writeStream.once("close", () => {
            if (existsSync(filePath)) {
                const fileSize = statSync(filePath).size;
                if (fileSize > 0) {
                    resolve();
                }
                else {
                    reject("writeStream.close", `Destination file invalid: ${filePath} (${fileSize})`);
                }
            }
            else {
                reject("writeStream.close", `Destination file not created: ${filePath}`);
            }
        });
        writeStream.once("error", (err) => reject("writeStream.error", err));
        readStream.pipe(writeStream);
    }
    catch (ex) {
        reject("try/catch (processResponse)", ex);
    }
    return { readStream, writeStream };
}

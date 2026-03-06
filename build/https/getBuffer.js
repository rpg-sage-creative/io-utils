import { stringifyJson, verbose } from "@rsc-utils/core-utils";
import { pipeline } from "node:stream";
import { createGunzip } from "node:zlib";
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
    const { promise, reject, resolve } = Promise.withResolvers();
    let request;
    let response;
    let stream;
    let pTracker = opts?.logPercent || opts?.progressTracker
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
        pTracker?.finish();
        pTracker = null;
    };
    const _resolve = (buffer) => {
        cleanup();
        resolve(buffer);
    };
    const _reject = (msg) => {
        cleanup();
        reject(msg);
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
            try {
                const rChunks = [];
                stream = response.headers["content-encoding"] === "gzip"
                    ? pipeline(response, createGunzip(), err => err ? _reject(err) : void (0))
                    : response;
                stream.once("close", _reject);
                stream.on("data", (rChunk) => {
                    pTracker?.increment(rChunk.byteLength);
                    rChunks.push(rChunk);
                });
                stream.once("end", () => _resolve(Buffer.concat(rChunks)));
                stream.once("error", _reject);
            }
            catch (ex) {
                _reject(ex);
            }
        });
        request.once("response", resp => pTracker?.start(+(resp.headers["content-length"] ?? 0)));
        request.once("close", _reject);
        request.once("error", _reject);
        request.once("timeout", _reject);
        if (method === "request") {
            request.write(payload);
        }
        request.end();
    }
    catch (ex) {
        _reject(ex);
    }
    return promise;
}

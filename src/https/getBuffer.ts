import { stringifyJson, verbose, type ProgressTracker } from "@rsc-utils/core-utils";
import type { FollowResponse, RedirectableRequest } from "follow-redirects";
import type { IncomingMessage } from "node:http";
import { pipeline } from "node:stream";
import { createGunzip, type Gunzip } from "node:zlib";
import { fileExistsSync } from "../fs/fileExistsSync.js";
import { readFile } from "../fs/readFile.js";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";

type Opts = { progressTracker?:ProgressTracker; logPercent?:boolean; };

/**
 * You can pass in a fully formed url or leave off the protocol and allow it to prepend "https://".
 * If you pass in a url with "http://" it will downgrade to use http protocol instead of https.
*/
export function getBuffer(url: string): Promise<Buffer>;

/**
 * You can pass in a fully formed url or leave off the protocol and allow it to prepend "https://".
 * If you pass in a url with "http://" it will downgrade to use http protocol instead of https.
 * Sending postData will stringify the value and then do a POST instead of a GET.
*/
export function getBuffer<T = any>(url: string, postData: T): Promise<Buffer>;

export function getBuffer<T = any>(url: string, postData?: T, opts?: Opts): Promise<Buffer> {
	if (typeof(url) !== "string") {
		return Promise.reject(new Error("Invalid Url"));
	}
	if (/^file:\/\//i.test(url)) {
		const path = url.slice(6);
		if (fileExistsSync(path)) {
			return readFile(path);
		}else {
			return Promise.reject(new Error("Invalid Path"));
		}
	}
	if (!(/^https?:\/\//i).test(url)) {
		url = "https://" + url;
	}

	const { promise, reject, resolve } = Promise.withResolvers<Buffer>();

	let request: RedirectableRequest<any, any> | null;
	let response: (IncomingMessage & FollowResponse) | null;
	let stream: (IncomingMessage & FollowResponse) | Gunzip | null;
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
	const _resolve = (buffer: Buffer) => {
		cleanup();
		resolve(buffer);
	};
	const _reject = (msg: any) => {
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
		} : { };
		verbose(`${options?.method ?? "GET"} ${url}`);
		if (options) {
			verbose({options});
		}
		if (postData) {
			verbose({postData});
		}

		request = protocol[method](url, options, _response => {
			response = _response;
			try {
				const rChunks: Buffer[] = [];
				stream = response.headers["content-encoding"] === "gzip"
					? pipeline(response, createGunzip(), err => err ? _reject(err) : void(0))
					: response;
				stream.once("close", _reject);
				stream.on("data", (rChunk: Buffer) => {
					pTracker?.increment(rChunk.byteLength);
					rChunks.push(rChunk);
				});
				stream.once("end", () => _resolve(Buffer.concat(rChunks)));
				stream.once("error", _reject);

			}catch(ex) {
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
		/** @todo do I need this req.end() ??? */
		request.end();
	}catch(ex) {
		_reject(ex);
	}

	return promise;
}

import { stringifyJson, verbose, type Optional, type ProgressTracker } from "@rsc-utils/core-utils";
import type { FollowResponse, RedirectableRequest } from "follow-redirects";
import type { IncomingMessage } from "node:http";
import { pipeline } from "node:stream";
import { createGunzip, type Gunzip } from "node:zlib";
import { fileExistsSync } from "../fs/fileExistsSync.js";
import { readFile } from "../fs/readFile.js";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";

type Opts = {
	logPercent?: boolean;
	progressTracker?: ProgressTracker;
	/** milliseconds */
	timeout?: number;
};

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
export function getBuffer<T = any>(url: string, postData: T, opts?: Opts): Promise<Buffer>;

export function getBuffer<T = any>(url: string, postData?: T, opts?: Opts): Promise<Buffer> {
	if (typeof(url) !== "string") {
		return Promise.reject(new TypeError("Invalid Url"));
	}

	const urlLower = url.toLowerCase();

	// we don't need to use the request logic for file reads
	if (urlLower.startsWith("file://")) {
		const path = url.slice(7);
		return fileExistsSync(path)
			? readFile(path)
			: Promise.reject(new Error("Invalid Path"));
	}

	// make sure the url starts with http:// or https://
	if (!(urlLower.startsWith("http://") || urlLower.startsWith("https://"))) {
		url = "https://" + url;
	}

	const { promise, reject:__reject, resolve:__resolve } = Promise.withResolvers<Buffer>();

	// declare all objects that should be cleaned up before resolving/rejecting
	let request: Optional<RedirectableRequest<any, any>>;
	let response: Optional<Response>;
	let stream: Optional<Stream>;
	let progressTracker = opts?.logPercent || opts?.progressTracker
		? opts.progressTracker ?? createHttpLogger(`Fetching Bytes: ${url}`, 0)
		: null;

	// we need to cleanup resources regardless of resolve vs reject
	const cleanup = () => {
		//#region stream cleanup
		stream?.removeAllListeners();
		stream?.destroy();
		stream = null;
		//#endregion

		//#region response cleanup
		response?.removeAllListeners();
		response?.destroy();
		response = null;
		//#endregion

		//#region request cleanup
		request?.removeAllListeners();
		request?.destroy();
		request = null;
		//#endregion

		//#region progress tracker cleanup
		if (progressTracker?.started) {
			progressTracker?.finish();
		}
		progressTracker = null;
		//#endregion
	};

	const resolve = (buffer: Buffer) => {
		cleanup();
		__resolve(buffer);
	};

	const reject = (ev: string, msg: any) => {
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

		/** @todo do I need this request.end() ??? */
		request.end();

	}catch(ex) {
		reject("try/catch (request)", ex);
	}

	return promise;
}

type Response = IncomingMessage & FollowResponse;
type Stream = (IncomingMessage & FollowResponse) | Gunzip;

type CreateStreamArgs = {
	response: Response;
	resolve: (buffer: Buffer) => void;
	reject: (ev: string, err: unknown) => void;
	progressTracker: Optional<ProgressTracker>;
}

/**
 * Reads all the data from the given response.
 * If the encoding is gzip, then a separate stream is created using gunzip.
 * The stream is returned so that it can be cleaned up by errors outside the response.
 * @returns the original Response or a new gunzip Stream
 */
function processResponse({ response, resolve, reject, progressTracker }: CreateStreamArgs): Stream | undefined {
	let stream: Stream | undefined;

	try {
		let rChunks: Buffer[] | null = [];

		if ("content-length" in response.headers) {
			const contentLength = +(response.headers["content-length"] ?? 0);
			progressTracker?.start(contentLength);
		}

		// create the stream based on content encoding
		stream = response.headers["content-encoding"] === "gzip"
			// if content is encoded as gzip, we need a gunzip stream
			? pipeline(response, createGunzip(), err => err ? reject("stream.gunzip", err) : void(0))
			// otherwise just use the response as is
			: response;

		stream.once("close", (err: any) =>
			reject("stream.close", err)
		);

		stream.on("data", (rChunk: Buffer) => {
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
			}else {
				rChunks = null;
				reject("stream.end", "empty buffer");
			}
		});

		stream.once("error", (err: any) =>
			reject("stream.error", err)
		);

	}catch(ex) {
		reject("try/catch (createStreamFromResponse)", ex);

	}

	return stream;
}
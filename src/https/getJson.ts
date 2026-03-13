import { parseJson, ProgressTracker, verbose } from "@rsc-utils/core-utils";
import { getText } from "./getText.js";

type Opts = {
	logPercent?: boolean;
	progressTracker?: ProgressTracker;
	/** milliseconds */
	timeout?: number;
};

/** Convenience wrapper for getText(url).then(text => parse(text)) */
export function getJson<T = any>(url: string): Promise<T>;

export function getJson<T = any, U = any>(url: string, postData: U, opts?: Opts): Promise<T>;

export function getJson<T = any, U = any>(url: string, postData?: U, opts?: Opts): Promise<T> {
	return new Promise((resolve, reject) => {
		getText(url, postData, opts).then(text => {
			try {
				resolve(parseJson(text));
			}catch(ex) {
				if (text === "Internal Server Error") {
					reject(text);
				}else {
					verbose(text);
					reject(ex);
				}
			}
		}, reject);
	});
}
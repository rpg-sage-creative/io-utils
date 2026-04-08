import { type ProgressTracker } from "@rsc-utils/core-utils";
export type GetBufferOpts = {
    /** defaults to true */
    followRedirects?: boolean;
    headers?: Record<string, string>;
    /** defaults to false */
    logPercent?: boolean;
    progressTracker?: ProgressTracker;
    /** milliseconds; defaults to no timeout */
    timeout?: number;
};
/**
 * You can pass in a fully formed url or leave off the protocol and allow it to prepend "https://".
 * If you pass in a url with "http://" it will downgrade to use http protocol instead of https.
*/
export declare function getBuffer(url: string): Promise<Buffer>;
/**
 * You can pass in a fully formed url or leave off the protocol and allow it to prepend "https://".
 * If you pass in a url with "http://" it will downgrade to use http protocol instead of https.
 * Sending postData will stringify the value and then do a POST instead of a GET.
*/
export declare function getBuffer<T = any>(url: string, postData: T, opts?: GetBufferOpts): Promise<Buffer>;

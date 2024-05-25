/// <reference types="node" />
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
export declare function getBuffer<T = any>(url: string, postData: T): Promise<Buffer>;

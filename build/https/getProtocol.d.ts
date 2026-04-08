import followRedirects from "follow-redirects";
import http from "node:http";
import https from "node:https";
/**
 * Returns http if the url starts with http://, or https otherwise.
 * Uses "follow-redirects" unless specifically told not to.
 */
export declare function getProtocol(url: `http://${string}`): typeof followRedirects.http;
export declare function getProtocol(url: `http://${string}`, followRedirects: false): typeof http;
export declare function getProtocol(url: `https://${string}`): typeof followRedirects.https;
export declare function getProtocol(url: `https://${string}`, followRedirects: false): typeof https;
export declare function getProtocol(url: string): typeof followRedirects.http | typeof followRedirects.https;
export declare function getProtocol(url: string, followRedirects: false): typeof http | typeof https;

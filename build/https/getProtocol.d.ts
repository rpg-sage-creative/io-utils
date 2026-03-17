import followRedirects from "follow-redirects";
/** Returns http if the url starts with http://, or https otherwise. */
export declare function getProtocol(url: `http://${string}`): typeof followRedirects.http;
export declare function getProtocol(url: `https://${string}`): typeof followRedirects.https;
export declare function getProtocol(url: string): typeof followRedirects.http | typeof followRedirects.https;

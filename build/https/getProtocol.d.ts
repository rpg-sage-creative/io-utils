import followRedirects from "follow-redirects";
/** Returns http if the url starts with http://, or https otherwise. */
export declare function getProtocol(url: string): typeof followRedirects.http | typeof followRedirects.https;

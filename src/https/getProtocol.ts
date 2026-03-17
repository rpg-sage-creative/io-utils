import followRedirects from "follow-redirects";

/** Returns http if the url starts with http://, or https otherwise. */
export function getProtocol(url: `http://${string}`): typeof followRedirects.http;
export function getProtocol(url: `https://${string}`): typeof followRedirects.https;
export function getProtocol(url: string): typeof followRedirects.http | typeof followRedirects.https;
export function getProtocol(url: string): typeof followRedirects.http | typeof followRedirects.https {
	return url.toLowerCase().startsWith("http://")
		? followRedirects.http
		: followRedirects.https;
}

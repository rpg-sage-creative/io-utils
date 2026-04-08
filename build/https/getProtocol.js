import followRedirects from "follow-redirects";
import http from "node:http";
import https from "node:https";
export function getProtocol(url, follow) {
    const isHttp = url.toLowerCase().startsWith("http://");
    if (follow === false) {
        return isHttp ? http : https;
    }
    return isHttp ? followRedirects.http : followRedirects.https;
}

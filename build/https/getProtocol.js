import followRedirects from "follow-redirects";
export function getProtocol(url) {
    return url.toLowerCase().startsWith("http://")
        ? followRedirects.http
        : followRedirects.https;
}

import followRedirects from "follow-redirects";
export function getProtocol(url) {
    return (/^http:\/\//i).test(url) ? followRedirects.http : followRedirects.https;
}

import followRedirects from "follow-redirects";
const HttpUrlRegExp = /^http:\/\//i;
export function getProtocol(url) {
    return HttpUrlRegExp.test(url) ? followRedirects.http : followRedirects.https;
}

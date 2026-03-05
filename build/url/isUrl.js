import { getUrlRegex } from "./getUrlRegex.js";
export function isUrl(value, options) {
    return typeof (value) === "string" ? getUrlRegex({ anchored: true, ...options }).test(value) : false;
}

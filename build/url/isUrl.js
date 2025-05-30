import { getUrlRegex } from "./getUrlRegex.js";
export function isUrl(value, options) {
    return value ? getUrlRegex({ anchored: true, ...options }).test(value) : false;
}

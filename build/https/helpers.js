export function isUrl(value) {
    return value?.match(/^https?:\/\/|^<https?:\/\/.*?>$/i) !== null;
}
export function cleanUrl(value) {
    if (value.startsWith("<") && value.endsWith(">")) {
        return value.slice(1, -1).trim();
    }
    return value;
}

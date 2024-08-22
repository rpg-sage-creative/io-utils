export function isUrl(value) {
    if (value) {
        return value.match(/^https?:\/\/|^<https?:\/\/.*?>$/i) !== null;
    }
    return false;
}

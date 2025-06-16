import { stringifyJson } from "@rsc-utils/core-utils";
export function contentToFileOutput(content, formatted) {
    if (Buffer.isBuffer(content)) {
        return content;
    }
    if (typeof (content) === "string") {
        return content;
    }
    let space;
    let maxLineLength;
    if (formatted) {
        space = "\t";
        maxLineLength = 250;
    }
    return stringifyJson(content, null, space, maxLineLength);
}

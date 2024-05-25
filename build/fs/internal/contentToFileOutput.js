import { formattedStringify, stringify } from "@rsc-utils/core-utils";
export function contentToFileOutput(content, formatted) {
    if (Buffer.isBuffer(content)) {
        return content;
    }
    if (typeof (content) === "string") {
        return content;
    }
    return formatted
        ? formattedStringify(content)
        : stringify(content);
}

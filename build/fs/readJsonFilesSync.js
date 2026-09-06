import { isDefined } from "@rsc-utils/core-utils";
import { filterFilesSync } from "./filterFilesSync.js";
import { readJsonFileSync } from "./readJsonFileSync.js";
/**
 * This uses filterFiles to narrow down the files before opening them.
 * If a contentFilter is given, then the opened files are filtered using it.
 */
export function readJsonFilesSync(path, options = {}) {
    // if no file extension/filter was given, this will ensure the files end with .json
    if (!options.fileExt && !options.fileFilter) {
        options.fileExt = "json";
    }
    const files = filterFilesSync(path, options);
    if (files.length === 0) {
        return [];
    }
    const out = [];
    // if no content filter was given, this will still ensure the object is defined
    const contentFilter = options.contentFilter
        ? async (json) => isDefined(json) ? options.contentFilter(json) : false
        : isDefined;
    for (const file of files) {
        const json = readJsonFileSync(file);
        // contentFilter uses isDefined internally so we can safely cast as T
        if (contentFilter(json)) {
            out.push(json);
        }
    }
    return out;
}

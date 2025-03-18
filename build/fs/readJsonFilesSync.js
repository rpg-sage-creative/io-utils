import { isDefined } from "@rsc-utils/core-utils";
import { filterFilesSync } from "./filterFilesSync.js";
import { readJsonFileSync } from "./readJsonFileSync.js";
export function readJsonFilesSync(path, options = {}) {
    if (!options.fileExt && !options.fileFilter) {
        options.fileExt = "json";
    }
    const files = filterFilesSync(path, options);
    if (files.length === 0) {
        return [];
    }
    const out = [];
    const contentFilter = options.contentFilter
        ? async (json) => isDefined(json) ? options.contentFilter(json) : false
        : isDefined;
    for (const file of files) {
        const json = readJsonFileSync(file);
        if (contentFilter(json)) {
            out.push(json);
        }
    }
    return out;
}

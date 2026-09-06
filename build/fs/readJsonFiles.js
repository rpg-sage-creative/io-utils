import { isDefined } from "@rsc-utils/core-utils";
import { filterFiles } from "./filterFiles.js";
import { readJsonFile } from "./readJsonFile.js";
/**
 * This uses filterFiles to narrow down the files before opening them.
 * If a contentFilter is given, then the opened files are filtered using it.
 */
export async function readJsonFiles(path, options = {}) {
    // if no file extension/filter was given, this will ensure the files end with .json
    if (!options.fileExt && !options.fileFilter) {
        options.fileExt = "json";
    }
    const files = await filterFiles(path, options);
    if (files.length === 0)
        return [];
    const out = [];
    // if no content filter was given, this will still ensure the object is defined
    const contentFilter = options.contentFilter
        ? async (json) => isDefined(json) ? options.contentFilter(json) : false
        : isDefined;
    for (const file of files) {
        const json = await readJsonFile(file);
        // contentFilter uses isDefined internally so we can safely cast as T
        if (await contentFilter(json)) {
            out.push(json);
        }
    }
    return out;
}

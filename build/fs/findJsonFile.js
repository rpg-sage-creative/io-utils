import { isDefined } from "@rsc-utils/core-utils";
import { filterFiles } from "./filterFiles.js";
import { readJsonFile } from "./readJsonFile.js";
export async function findJsonFile(path, options) {
    if (!options.fileExt && !options.fileFilter) {
        options.fileExt = "json";
    }
    const files = await filterFiles(path, options);
    if (files.length === 0)
        return undefined;
    const contentFilter = options.contentFilter
        ? async (json) => isDefined(json) ? options.contentFilter(json) : false
        : isDefined;
    for (const file of files) {
        const json = await readJsonFile(file);
        if (await contentFilter(json)) {
            return json;
        }
    }
    return undefined;
}

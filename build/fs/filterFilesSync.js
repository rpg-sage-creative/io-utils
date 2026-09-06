import { join } from "node:path";
import { createExtFilter } from "./internal/createExtFilter.js";
import { isDirSync } from "./isDirSync.js";
import { listFilesSync } from "./listFilesSync.js";
function createOptions(input, recursive) {
    switch (typeof (input)) {
        case "string": return { fileExt: input, recursive };
        case "function": return { fileFilter: input, recursive };
        default: return input;
    }
}
/** Combines given fileExt and fileFilter or simply returns createExtFilter("json") */
function createFileFilter(options) {
    if (options) {
        const { fileExt, fileFilter } = options;
        if (fileExt) {
            const extFilter = createExtFilter(fileExt);
            if (fileFilter) {
                return (fileName, filePath) => extFilter(fileName) && fileFilter(fileName, filePath);
            }
            return extFilter;
        }
        else if (fileFilter) {
            return fileFilter;
        }
    }
    throw Error("filterFilesSync must ge given a fileExt or fileFilter");
}
export function filterFilesSync(path, extOrFilterOrOpts, _recursive) {
    const output = [];
    const options = createOptions(extOrFilterOrOpts, _recursive);
    const filter = createFileFilter(options);
    const files = listFilesSync(path);
    for (const fileName of files) {
        const filePath = join(path, fileName);
        // check to see if this is a directory
        if (isDirSync(filePath)) {
            // only process it if recursive
            if (options.recursive) {
                // process if no dirFilter or if dirFilter returns truthy
                const shouldProcess = !options.dirFilter
                    || options.dirFilter(fileName, filePath);
                if (shouldProcess) {
                    const children = filterFilesSync(filePath, options);
                    for (const child of children) {
                        output.push(child);
                    }
                }
            }
            // run this file through the filter
        }
        else if (filter(fileName, filePath)) {
            output.push(filePath);
        }
    }
    return output;
}

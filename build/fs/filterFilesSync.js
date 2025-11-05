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
        const filePath = `${path}/${fileName}`;
        if (isDirSync(filePath)) {
            if (options.recursive) {
                if (options.dirFilter ? options.dirFilter(fileName, filePath) : true) {
                    const children = filterFilesSync(filePath, options);
                    children.forEach(child => output.push(child));
                }
            }
        }
        else if (filter(fileName, filePath)) {
            output.push(filePath);
        }
    }
    return output;
}

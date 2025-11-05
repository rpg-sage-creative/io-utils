import { createExtFilter } from "./internal/createExtFilter.js";
import { isDir } from "./isDir.js";
import { listFiles } from "./listFiles.js";
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
    throw Error("filterFiles must ge given a fileExt or fileFilter");
}
export async function filterFiles(path, extOrFilterOrOpts, _recursive) {
    const output = [];
    const options = createOptions(extOrFilterOrOpts, _recursive);
    const filter = createFileFilter(options);
    const files = await listFiles(path).catch(() => []);
    for (const fileName of files) {
        const filePath = `${path}/${fileName}`;
        if (await isDir(filePath)) {
            if (options.recursive) {
                if (options.dirFilter ? await options.dirFilter(fileName, filePath) : true) {
                    const children = await filterFiles(filePath, options);
                    children.forEach(child => output.push(child));
                }
            }
        }
        else if (await filter(fileName, filePath)) {
            output.push(filePath);
        }
    }
    return output;
}

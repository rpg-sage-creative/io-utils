import { createExtFilter } from "./internal/createExtFilter.js";
import { isDirSync } from "./isDirSync.js";
import { listFilesSync } from "./listFilesSync.js";
export function filterFilesSync(path, extOrFilter, recursive) {
    const output = [];
    const filter = typeof (extOrFilter) === "function" ? extOrFilter : createExtFilter(extOrFilter);
    const files = listFilesSync(path);
    for (const fileName of files) {
        const filePath = `${path}/${fileName}`;
        const result = filter(fileName, filePath);
        if (result) {
            output.push(filePath);
        }
        if (recursive && isDirSync(filePath)) {
            output.push(...filterFilesSync(filePath, filter, true));
        }
    }
    return output;
}

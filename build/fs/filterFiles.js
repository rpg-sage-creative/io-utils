import { isPromise } from "util/types";
import { createExtFilter } from "./internal/createExtFilter.js";
import { listFiles } from "./listFiles.js";
export async function filterFiles(path, extOrFilter, recursive) {
    const output = [];
    const filter = typeof (extOrFilter) === "function" ? extOrFilter : createExtFilter(extOrFilter);
    const files = await listFiles(path).catch(() => []);
    for (const fileName of files) {
        const filePath = `${path}/${fileName}`;
        const promise = filter(fileName, filePath);
        const result = isPromise(promise) ? await promise : promise;
        if (result) {
            output.push(filePath);
        }
        if (recursive) {
            output.push(...(await filterFiles(filePath, filter, true)));
        }
    }
    return output;
}

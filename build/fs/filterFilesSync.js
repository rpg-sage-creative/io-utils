import { listFilesSync } from "./listFilesSync.js";
export function filterFilesSync(path, filter, recursive) {
    const output = [];
    const files = listFilesSync(path);
    for (const fileName of files) {
        const filePath = `${path}/${fileName}`;
        const result = filter(fileName, filePath);
        if (result) {
            output.push(filePath);
        }
        if (recursive) {
            output.push(...filterFilesSync(filePath, filter, true));
        }
    }
    return output;
}

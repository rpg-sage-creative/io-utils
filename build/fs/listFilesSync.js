import { error } from "@rsc-utils/core-utils";
import { readdirSync } from "node:fs";
import { createExtFilter } from "./internal/createExtFilter.js";
export function listFilesSync(path, ext) {
    try {
        const files = readdirSync(path);
        if (ext) {
            return files.filter(createExtFilter(ext));
        }
        return files;
    }
    catch (ex) {
        error(ex);
    }
    return [];
}

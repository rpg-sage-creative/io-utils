import { error } from "@rsc-utils/core-utils";
import { readdirSync } from "fs";
export function listFilesSync(path, ext) {
    try {
        const files = readdirSync(path);
        if (ext) {
            const regex = new RegExp(`\\.${ext}$`, "i");
            return files.filter(file => file.match(regex));
        }
        return files;
    }
    catch (ex) {
        error(ex);
    }
    return [];
}

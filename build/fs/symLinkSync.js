import { error } from "@rsc-utils/core-utils";
import { mkdirSync, rmSync, symlinkSync } from "fs";
import { toFilePath } from "./internal/toFilePath.js";
export function symLinkSync(target, path, options) {
    try {
        if (options?.mkdir) {
            mkdirSync(toFilePath(path), { recursive: true });
        }
    }
    catch (ex) {
        error(ex);
    }
    try {
        symlinkSync(target, path, "file");
    }
    catch (outer) {
        const overwrite = outer.code === "EEXIST" && options?.overwrite;
        if (!overwrite) {
            error(outer);
            return false;
        }
        try {
            rmSync(path, { force: true });
            symlinkSync(target, path, "file");
        }
        catch (inner) {
            error(inner);
            return false;
        }
    }
    return true;
}

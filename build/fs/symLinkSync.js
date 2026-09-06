import { error } from "@rsc-utils/core-utils";
import { mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
export function symLinkSync(target, path, options) {
    try {
        if (options?.makeDir) {
            const pathParent = dirname(path);
            mkdirSync(pathParent, { recursive: true });
        }
    }
    catch (ex) {
        error(ex);
    }
    try {
        // let's just try to make it and catch the EEXIST error
        symlinkSync(target, path, "file");
    }
    catch (outer) {
        const overwrite = outer.code === "EEXIST" && options?.overwrite;
        if (!overwrite) {
            error(outer);
            return false;
        }
        try {
            // remove existing
            rmSync(path, { force: true });
            // try again
            symlinkSync(target, path, "file");
        }
        catch (inner) {
            error(inner);
            return false;
        }
    }
    return true;
}

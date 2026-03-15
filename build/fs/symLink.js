import { error } from "@rsc-utils/core-utils";
import { symlink } from "node:fs";
import { dirname } from "node:path";
import { deleteFile } from "./deleteFile.js";
import { makeDir } from "./makeDir.js";
export async function symLink(target, path, options) {
    if (options?.makeDir) {
        const pathParent = dirname(path);
        await makeDir(pathParent);
    }
    return new Promise(async (res) => {
        try {
            symlink(target, path, "file", () => res(true));
        }
        catch (outer) {
            const overwrite = outer?.code === "EEXIST" && options?.overwrite;
            if (!overwrite) {
                error(outer);
                res(false);
                return;
            }
            try {
                const deleted = await deleteFile(path);
                if (deleted) {
                    symlink(target, path, "file", () => res(true));
                }
                else {
                    res(false);
                }
            }
            catch (inner) {
                error(inner);
                res(false);
            }
        }
    });
}

import { error } from "@rsc-utils/core-utils";
import { symlink } from "fs";
import { deleteFile } from "./deleteFile.js";
import { toFilePath } from "./internal/toFilePath.js";
import { makeDir } from "./makeDir.js";
export async function symLink(target, path, options) {
    if (options?.makeDir) {
        await makeDir(toFilePath(path));
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

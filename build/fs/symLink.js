import { error } from "@rsc-utils/core-utils";
import { mkdir, rm, symlink } from "fs";
import { toFilePath } from "./internal/toFilePath.js";
export async function symLink(target, path, options) {
    if (options?.mkdir) {
        await new Promise(res => {
            mkdir(toFilePath(path), { recursive: true }, err => {
                if (err)
                    error(err);
                res(!err);
            });
        });
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
                rm(path, { force: true }, () => symlink(target, path, "file", () => res(true)));
            }
            catch (inner) {
                error(inner);
                res(false);
            }
        }
    });
}

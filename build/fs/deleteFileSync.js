import { rmSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
export function deleteFileSync(path) {
    const before = fileExistsSync(path);
    if (before) {
        rmSync(path);
        const after = fileExistsSync(path);
        return before !== after;
    }
    return false;
}

import { readFileSync as fsReadFileSync } from "fs";
import { fileExistsSync } from "./fileExistsSync.js";
export function readFileSync(path) {
    if (fileExistsSync(path)) {
        const buffer = fsReadFileSync(path);
        if (Buffer.isBuffer(buffer)) {
            return buffer;
        }
    }
    return null;
}

import { existsSync } from "fs";
export function fileExistsSync(path) {
    return existsSync(path);
}

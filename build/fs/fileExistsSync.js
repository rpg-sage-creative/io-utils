import { existsSync } from "node:fs";
export function fileExistsSync(path) {
    return existsSync(path);
}

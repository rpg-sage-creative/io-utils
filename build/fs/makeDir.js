import { mkdir } from "node:fs";
/** Convenience wrapper for fs.mkdir(path, { recursive:true }) that resolves to boolean. */
export function makeDir(path) {
    return new Promise((resolve, reject) => {
        mkdir(path, { recursive: true }, error => error ? reject(error) : resolve(true));
    });
}

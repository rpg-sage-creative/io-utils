import { mkdir } from "node:fs";
export function makeDir(path) {
    return new Promise((resolve, reject) => {
        mkdir(path, { recursive: true }, error => error ? reject(error) : resolve(true));
    });
}

import { readFile } from "./readFile.js";
/**
 * Convenience for: readFile(path, encoding).then(buffer => buffer.toString(encoding));
 * Rejections from readFile are bubbled.
 */
export function readText(path, encoding = "utf8") {
    return new Promise((resolve, reject) => {
        readFile(path).then(buffer => {
            resolve(buffer.toString(encoding));
        }, reject);
    });
}

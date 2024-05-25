import { readFile } from "./readFile.js";
export function readText(path, encoding = "utf8") {
    return new Promise((resolve, reject) => {
        readFile(path).then(buffer => {
            resolve(buffer.toString(encoding));
        }, reject);
    });
}

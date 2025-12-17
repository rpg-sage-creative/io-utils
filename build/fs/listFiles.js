import { readdir } from "node:fs";
import { createExtFilter } from "./internal/createExtFilter.js";
export function listFiles(path, ext) {
    return new Promise((resolve, reject) => {
        readdir(path, (error, files) => {
            if (error) {
                reject(error);
            }
            else if (ext) {
                resolve(files.filter(createExtFilter(ext)));
            }
            else {
                resolve(files);
            }
        });
    });
}

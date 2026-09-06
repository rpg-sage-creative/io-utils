import { readdir } from "node:fs";
import { createExtFilter } from "./internal/createExtFilter.js";
/**
 * Lists all the filenames found in the given path, filtered by extension if given.
 */
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

import { parseJsonDb } from "./internal/parseJsonDb.js";
import { readText } from "./readText.js";
export function readJsonDb(path) {
    return new Promise((resolve, reject) => {
        readText(path).then(raw => {
            const objects = raw ? parseJsonDb(raw) : [];
            if (objects.length) {
                resolve(objects);
            }
            else {
                reject(`Unable to read "${path}"`);
            }
        }, reject);
    });
}

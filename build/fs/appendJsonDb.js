import { appendFile, mkdir } from "fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
function append(filePathAndName, content) {
    return new Promise((resolve, reject) => {
        appendFile(filePathAndName, "\n" + contentToFileOutput(content), error => {
            if (error) {
                reject(error);
            }
            else {
                resolve(true);
            }
        });
    });
}
export function appendJsonDb(filePathAndName, content, makeDir) {
    return new Promise((resolve, reject) => {
        if (makeDir) {
            mkdir(toFilePath(filePathAndName), { recursive: true }, error => {
                if (error) {
                    reject(error);
                }
                else {
                    append(filePathAndName, content).then(resolve, reject);
                }
            });
        }
        else {
            append(filePathAndName, content).then(resolve, reject);
        }
    });
}

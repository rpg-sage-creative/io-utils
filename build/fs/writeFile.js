import { writeFile as fsWriteFile, mkdir } from "fs";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { toFilePath } from "./internal/toFilePath.js";
function write(filePathAndName, content, formatted) {
    return new Promise((resolve, reject) => {
        fsWriteFile(filePathAndName, contentToFileOutput(content, formatted), error => {
            if (error) {
                reject(error);
            }
            else {
                resolve(true);
            }
        });
    });
}
export function writeFile(filePathAndName, content, makeDir, formatted) {
    return new Promise((resolve, reject) => {
        if (makeDir) {
            mkdir(toFilePath(filePathAndName), { recursive: true }, error => {
                if (error) {
                    reject(error);
                }
                else {
                    write(filePathAndName, content, formatted).then(resolve, reject);
                }
            });
        }
        else {
            write(filePathAndName, content, formatted).then(resolve, reject);
        }
    });
}

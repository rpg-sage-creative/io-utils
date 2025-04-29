import { appendFile as fsAppendFile } from "fs";
export function appendFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fsAppendFile(filePath, data, error => error ? reject(error) : resolve(true));
    });
}

import { readFile as fsReadFile } from "fs";
export function readFile(path) {
    return new Promise((resolve, reject) => {
        fsReadFile(path, null, (error, buffer) => {
            if (error) {
                reject(error);
            }
            else if (Buffer.isBuffer(buffer)) {
                resolve(buffer);
            }
            else {
                reject("Not a Buffer");
            }
        });
    });
}

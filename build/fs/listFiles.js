import { readdir } from "fs";
export function listFiles(path, ext) {
    return new Promise((resolve, reject) => {
        readdir(path, (error, files) => {
            if (error) {
                reject(error);
            }
            else {
                if (ext) {
                    const regex = new RegExp(`\\.${ext}$`, "i");
                    resolve(files.filter(file => file.match(regex)));
                }
                else {
                    resolve(files);
                }
            }
        });
    });
}

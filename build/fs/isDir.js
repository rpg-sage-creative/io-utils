import { stat, Stats } from "fs";
export function isDir(filePath) {
    return new Promise((resolve, reject) => {
        stat(filePath, (error, stats) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stats.isDirectory());
            }
        });
    });
}

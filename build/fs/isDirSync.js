import { statSync } from "fs";
export function isDirSync(filePath) {
    const stats = statSync(filePath, { throwIfNoEntry: false });
    return stats?.isDirectory() === true;
}

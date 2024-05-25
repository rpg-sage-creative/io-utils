import { readFileSync } from "./readFileSync.js";
export function readTextSync(path, encoding = "utf8") {
    const buffer = readFileSync(path);
    return buffer?.toString(encoding) ?? null;
}

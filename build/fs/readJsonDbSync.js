import { parseJsonDb } from "./internal/parseJsonDb.js";
import { readTextSync } from "./readTextSync.js";
export function readJsonDbSync(path) {
    const raw = readTextSync(path);
    return raw ? parseJsonDb(raw) : [];
}

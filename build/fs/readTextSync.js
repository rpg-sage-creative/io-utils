import { readFileSync } from "./readFileSync.js";
/**
 * Convenience for: readFileSync(path).toString(encoding);
 * Returns null if readFileSync returns null.
 */
export function readTextSync(path, encoding = "utf8") {
    const buffer = readFileSync(path);
    return buffer?.toString(encoding) ?? null;
}

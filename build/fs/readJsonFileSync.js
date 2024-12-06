import { parseJson } from "@rsc-utils/core-utils";
import { readTextSync } from "./readTextSync.js";
export function readJsonFileSync(path) {
    const json = readTextSync(path);
    let object;
    if (json !== null) {
        try {
            object = parseJson(json);
        }
        catch (ex) {
            object = null;
        }
    }
    return object ?? null;
}

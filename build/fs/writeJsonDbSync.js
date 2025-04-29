import { stringifyJson } from "@rsc-utils/core-utils";
import { writeFileSync } from "./writeFileSync.js";
export function writeJsonDbSync(filePathAndName, values, options) {
    const content = values.map(value => stringifyJson(value)).join("\n");
    return writeFileSync(filePathAndName, content, options);
}

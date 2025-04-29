import { stringifyJson } from "@rsc-utils/core-utils";
import { writeFile } from "./writeFile.js";
export function writeJsonDb(filePathAndName, values, makeDir) {
    const content = values.map(value => stringifyJson(value)).join("\n");
    return writeFile(filePathAndName, content, { makeDir });
}

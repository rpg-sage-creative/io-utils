import { stringify } from "@rsc-utils/core-utils";
import { writeFile } from "./writeFile.js";
export function writeJsonDb(filePathAndName, values, makeDir) {
    const content = values.map(value => stringify(value)).join("\n");
    return writeFile(filePathAndName, content, makeDir);
}

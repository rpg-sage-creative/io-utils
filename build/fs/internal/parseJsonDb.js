import { error, parseJson } from "@rsc-utils/core-utils";
export function parseJsonDb(raw) {
    const objects = [];
    const lines = raw?.split("\n");
    lines?.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
            try {
                objects.push(parseJson(trimmed));
            }
            catch (ex) {
                error({ index, ex });
            }
        }
    });
    return objects;
}

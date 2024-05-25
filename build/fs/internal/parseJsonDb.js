import { error, parse } from "@rsc-utils/core-utils";
export function parseJsonDb(raw) {
    const objects = [];
    const lines = (raw ?? "").split(/\r?\n\r?/);
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.length > 0) {
            try {
                objects.push(parse(trimmed));
            }
            catch (ex) {
                error({ index, ex });
            }
        }
    });
    return objects;
}

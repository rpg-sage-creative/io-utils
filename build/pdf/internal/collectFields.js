import { collectCheckFields } from "./collectCheckFields.js";
import { collectTextFields } from "./collectTextFields.js";
export function collectFields(json) {
    const fields = [];
    const pages = json?.Pages ?? [];
    pages.forEach(page => {
        fields.push(...collectTextFields(page));
        fields.push(...collectCheckFields(page));
    });
    return fields;
}

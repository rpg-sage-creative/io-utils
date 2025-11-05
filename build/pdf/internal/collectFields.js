import { collectCheckFields } from "./collectCheckFields.js";
import { collectTextFields } from "./collectTextFields.js";
export function collectFields(json) {
    const fields = [];
    const pages = json?.Pages ?? [];
    pages.forEach(page => {
        const textFields = collectTextFields(page);
        textFields.forEach(field => fields.push(field));
        const checkFields = collectCheckFields(page);
        checkFields.forEach(field => fields.push(field));
    });
    return fields;
}

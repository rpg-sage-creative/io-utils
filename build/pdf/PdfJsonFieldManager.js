import { collectFields } from "./internal/collectFields.js";
import { stringOrUndefined } from "./internal/stringOrUndefined.js";
export class PdfJsonFieldManager {
    fields;
    constructor(fields) {
        this.fields = fields;
    }
    find(name) {
        return this.fields.find(field => field.name === name);
    }
    findChecked(name) {
        const field = this.find(name);
        this.removeField(field);
        return field?.checked === true;
    }
    findValue(name) {
        const field = this.find(name);
        this.removeField(field);
        return stringOrUndefined(field?.value);
    }
    removeField(field) {
        if (field) {
            const fieldIndex = this.fields.indexOf(field);
            if (fieldIndex > -1) {
                this.fields.splice(fieldIndex, 1);
            }
        }
    }
    static from(input) {
        return new PdfJsonFieldManager(collectFields(input));
    }
}

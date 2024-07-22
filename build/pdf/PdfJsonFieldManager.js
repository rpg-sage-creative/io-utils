import { collectFields } from "./internal/collectFields.js";
import { stringOrUndefined } from "./internal/stringOrUndefined.js";
export class PdfJsonFieldManager {
    fields;
    initialLength;
    constructor(input) {
        if (input) {
            if (input instanceof PdfJsonFieldManager) {
                this.fields = input.fields.slice();
            }
            else if (Array.isArray(input)) {
                this.fields = input;
            }
            else {
                this.fields = collectFields(input);
            }
        }
        else {
            this.fields = [];
        }
        this.initialLength = this.fields.length;
    }
    get isEmpty() {
        return this.fields.length === 0;
    }
    get length() {
        return this.fields.length;
    }
    find(name) {
        return this.fields.find(field => field.name === name);
    }
    findChecked(name, remove) {
        const field = this.find(name);
        if (remove)
            this.removeField(field);
        return field?.checked === true;
    }
    findValue(name, remove) {
        const field = this.find(name);
        if (remove)
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
        return new PdfJsonFieldManager(input);
    }
}
